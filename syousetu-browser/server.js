// server.js
const express = require('express');
const database = require('./database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const session = require('express-session');
app.use(session({
  secret: 'syousetu-browser-secret', 
  resave: false,
  saveUninitialized: false
}));

function requireLogin(req, res, next) {
    if (!req.session.userID) {
      return res.redirect('/login');
    }
    next();
}


function renderNovelList(req, res, options = {}) {
  const keyword = req.query.q;
  const exclude = req.query.exclude;
  const sort = req.query.sort || 'new';
  const page = parseInt(req.query.page) || 1; //現在の頁
  const novelsPerPage = 20;
  const userID = req.session.userID;
 
  // ログイン中のユーザーの小説だけ取得する
  let novels = userID
    ? database.prepare('SELECT * FROM novels WHERE user_id = ?').all(userID)
    : [];

  //絞り込む
  if (keyword) {
    const lowerCaseKey = keyword.toLowerCase();
    novels = novels.filter(novel =>
        novel.title.toLowerCase().includes(lowerCaseKey) ||
        novel.summary.toLowerCase().includes(lowerCaseKey) ||
        novel.tags.toLowerCase().includes(lowerCaseKey)
    );
  }
  if (exclude) {
    const lowerCaseKey = exclude.toLowerCase();
    novels = novels.filter(novel => !(
        novel.tags.toLowerCase().includes(lowerCaseKey) ||
        novel.title.toLowerCase().includes(lowerCaseKey)
    ));
  }

  //並び替え
  if (sort == 'rating') {
    novels.sort((a,b) => b.rating - a.rating);
  } else if (sort == 'new') {
    novels.sort((a,b) => b.id - a.id);
  }

  const totalNovels = novels.length;
  const totalPages  = Math.ceil(totalNovels/novelsPerPage);

  const start       = (page - 1) * novelsPerPage;
  const pageNovels  = novels.slice(start, start+novelsPerPage);

  const username = req.session.username || null;

  res.render('index', {
    novels: pageNovels,
    keyword,
    sort,
    exclude,
    page,
    totalPages,
    totalNovels,
    username,
    allowEdit: options.allowEdit !== false
  });
}

//小説の一覧を表示する
app.get('/', requireLogin, (req, res) => {
  renderNovelList(req, res, { allowEdit: false });
});

// 編集用の一覧画面を表示する（操作ボタンを非表示）
app.get('/edit', requireLogin, (req, res) => {
  renderNovelList(req, res, { allowEdit: true });
});

// 新規登録フォームの画面を表示する
app.get('/register', (req, res) => {
  res.render('register');
});

// 新規登録フォームから送られた情報でユーザーを作成する
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // パスワードをハッシュ化する
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    database.prepare(
      'INSERT INTO users (username, password) VALUES (?, ?)'
    ).run(username, hashedPassword);

    res.redirect('/login');
  } catch (e) {
    return res.render('register', { error: 'そのユーザーネームはすでに使われています。' });
    //res.send('そのユーザー名はすでに使われています。<a href="/register">戻る</a>');
  }
});

// ログインフォームの画面を表示する
app.get('/login', (req, res) => {
  res.render('login');
});

// ログインフォームから送られた情報を確認する
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = database.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.render('login', { error: 'ユーザIDまたはパスワードが正しくありません。' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.render('login', { error: 'ユーザIDまたはパスワードが正しくありません。' });
  }
 

  //ログイン成功 -> セッションUSER情報保存
  req.session.userID   = user.id;
  req.session.username = user.username;

  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// 登録フォームの画面を表示する
app.get('/add', requireLogin, (req, res) => {
  res.render('add', {
    username: req.session.username || null
  });
});

// フォームからのデータをデータベースに保存する
app.post('/add', requireLogin, (req, res) => {
  const { title, url, tags, summary, status, rating } = req.body;
  const userID = req.session.userID;

  database.prepare(
    'INSERT INTO novels (title, url, tags, summary, status, rating, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(title, url, tags, summary, status, rating, userID);

  res.redirect('/');
});

app.post('/delete/:id', requireLogin, (req, res) => {
    const id = req.params.id;
    database.prepare('DELETE FROM novels WHERE id = ?').run(id);
    res.redirect('/');
});

//元のデータ入れてる状態
app.get('/edit/:id', requireLogin, (req, res) => {
    const id = req.params.id;
    const novel = database.prepare('SELECT * FROM novels WHERE id = ?').get(id);
    res.render('edit', {novel, username: req.session.username || null});
});

//データベース更新
app.post('/edit/:id', requireLogin, (req, res) => {
    const id = req.params.id;
    const { title, url, tags, summary, status, rating } = req.body;

    database.prepare('UPDATE novels SET title = ?, url = ?, tags = ?, summary = ?, status = ?, rating = ? WHERE id = ?').run(title,url,tags,summary,status,rating,id);
    res.redirect('/');
});
 
app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});