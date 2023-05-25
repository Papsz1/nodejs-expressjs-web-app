export default function handleNotFound(req, res) {
  res.status(404).render('error', { message: 'The web site could not be found' });
}
