const express = require('express');
const database = require('./database');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'syousetu-browser-secret',
  resave: false,
  saveUninitialized: false
}));

function requireLogin(req, res, next) {
  if (!req.session.userID) return res.redirect('/login');
  next();
}

async function renderNovelList(req, res, options = {}) {
  const keyword = req.query.q;
  const exclude = req.query.exclude;
  const sort = req.query.sort || 'new';
  const page = parseInt(req.query.page) || 1;
  const novelsPerPage = 20;
  const userID = req.session.userID;

  let novels = [];
  if (userID) {
    const result = await database.execute({
      sql: 'SELECT * FROM novels WHERE user_id = ?',
      args: [userID]
    });
    novels = result.rows;
  }

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

  if (sort === 'rating') {
    novels.sort((a, b) => b.rating - a.rating);
  } else {
    novels.sort((a, b) => b.id - a.id);
  }

  const totalNovels = novels.length;
  const totalPages = Math.ceil(totalNovels / novelsPerPage) || 1;
  const start = (page - 1) * novelsPerPage;
  const pageNovels = novels.slice(start, start + novelsPerPage);
  const username = req.session.username || null;

  res.render('index', {
    novels: pageNovels, keyword, sort, exclude,
    page, totalPages, totalNovels, username,
    allowEdit: options.allowEdit !== false
  });
}

app.get('/', requireLogin, (req, res) => {
  renderNovelList(req, res, { allowEdit: false });
});

app.get('/edit', requireLogin, (req, res) => {
  renderNovelList(req, res, { allowEdit: true });
});

app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await database.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [username, hashedPassword]
    });
    res.redirect('/login');
  } catch (e) {
    res.render('register', { error: 'そのユーザーネームはすでに使われています。' });
  }
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await database.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username]
  });
  const user = result.rows[0];

  if (!user) return res.render('login', { error: 'ユーザIDまたはパスワードが正しくありません。' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.render('login', { error: 'ユーザIDまたはパスワードが正しくありません。' });

  req.session.userID = user.id;
  req.session.username = user.username;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/add', requireLogin, (req, res) => {
  res.render('add', { username: req.session.username || null });
});

app.post('/add', requireLogin, async (req, res) => {
  const { title, url, tags, summary, status, rating } = req.body;
  const userID = req.session.userID;
  await database.execute({
    sql: 'INSERT INTO novels (title, url, tags, summary, status, rating, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [title, url, tags, summary, status, rating, userID]
  });
  res.redirect('/');
});

app.post('/delete/:id', requireLogin, async (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;
  await database.execute({
    sql: 'DELETE FROM novels WHERE id = ? AND user_id = ?',
    args: [id, userID]
  });
  res.redirect('/');
});

app.get('/edit/:id', requireLogin, async (req, res) => {
  const id = req.params.id;
  const result = await database.execute({
    sql: 'SELECT * FROM novels WHERE id = ?',
    args: [id]
  });
  const novel = result.rows[0];
  res.render('edit', { novel, username: req.session.username || null });
});

app.post('/edit/:id', requireLogin, async (req, res) => {
  const id = req.params.id;
  const userID = req.session.userID;
  const { title, url, tags, summary, status, rating } = req.body;
  await database.execute({
    sql: 'UPDATE novels SET title = ?, url = ?, tags = ?, summary = ?, status = ?, rating = ? WHERE id = ? AND user_id = ?',
    args: [title, url, tags, summary, status, rating, id, userID]
  });
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});