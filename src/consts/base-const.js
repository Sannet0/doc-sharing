const correctOriginPath = (backSteps = 0) => {
  const pathArray = __dirname.split('/');
  let path = '';
  backSteps += 3;

  for(let i = 1; i <= pathArray.length - backSteps; i++) {
    path += '/' + pathArray[i];
  }

  return path;
}

const extractTypeBase64 = (image) => {
  const data = {
    base64: '',
    type: ''
  }
  const [ info, base64 ] = image?.split(',') || [];
  data.base64 = base64 || '';
  data.type = info?.split(/[^a-zа-яё0-9]/gi)[2] || '';
  return data;
}

module.exports = {
  correctOriginPath,
  extractTypeBase64
}
