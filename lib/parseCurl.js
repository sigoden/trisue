export default function parseCurl(argv) {
  const arg = parse(argv.slice(5));
  const uri = arg["_"] || "";
  const method = arg["X"] || arg["request"] || "GET";
  const body = arg["data-binary"] || arg["data"] || "";
  const headers = arg["H"] || arg["header"] || [];
  return { uri, headers, method, body };
}

function parse(cli) {
  const argv = parseArgsStringToArgv(cli);
  const re = /^-{1,2}\w/;
  const getRidDash = v => {
    if (v[0] !== "-") return v;
    if (v[1] === "-") return v.slice(2);
    return v.slice(1);
  };
  const ret = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (re.test(v)) {
      if (re[1] !== "-" && re.length > 2) {
        v.slice(1)
          .split("")
          .forEach(k => {
            ret[k] = true;
          });
        continue;
      }
      const key = getRidDash(v);
      const nextV = argv[i + 1];
      if (nextV && !re.test(nextV)) {
        if (ret[key]) {
          if (Array.isArray(ret[key])) {
            ret[key].push(nextV);
          } else {
            ret[key] = [ret[key], nextV];
          }
        } else {
          ret[key] = nextV;
        }
        i++;
        continue;
      }
      ret[key] = true;
    } else {
      ret._.push(v);
    }
  }
  return ret;
}

function parseArgsStringToArgv(value) {
  // ([^\s'"]+(['"])([^\2]*?)\2) Match `text"quotes text"`

  // [^\s'"] or Match if not a space ' or "

  // (['"])([^\4]*?)\4 or Match "quoted text" without quotes
  // `\2` and `\4` are a backreference to the quote style (' or ") captured
  const myRegexp = /([^\s'"]+(['"])([^\2]*?)\2)|[^\s'"]+|(['"])([^\4]*?)\4/gi;
  const myString = value;
  const myArray = [];
  let match;
  do {
    // Each call to exec returns the next regex match as an array
    match = myRegexp.exec(myString);
    if (match !== null) {
      // Index 1 in the array is the captured group if it exists
      // Index 0 is the matched text, which we use if no captured group exists
      myArray.push(match[1] || match[5] || match[0]);
    }
  } while (match !== null);

  return myArray;
}
