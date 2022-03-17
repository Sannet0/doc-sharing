const base64Parse = (base64) => {
  const data = base64.split(',');
  return data[1];
};

const origValue = (value, helpers) => {
  return  helpers.original;
}

module.exports = {
  base64Parse,
  origValue
}
