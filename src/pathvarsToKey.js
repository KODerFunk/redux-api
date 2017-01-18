export default function pathvarsToKey(pathvars) {
  const key = pathvars ?
    Object.keys(pathvars)
      .sort((a, b) => a > b)
      .filter(key => pathvars[key])
      .map(key => `${key}_${pathvars[key]}`).join('_')
    :
    '';
  return key || 'default';
}
