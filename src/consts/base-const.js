const correctOriginPath = (backSteps = 0) => {
  const pathArray = __dirname.split('/');
  let path = '';
  backSteps += 3;

  for(let i = 1; i <= pathArray.length - backSteps; i++) {
    path += '/' + pathArray[i];
  }

  return path;
}

module.exports = {
  correctOriginPath
}
