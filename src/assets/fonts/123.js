let url = 'https://www.baidu.com/s?tn=620&md=125';

function qureyURLParameter(url) {
  let obj = {};
  if(url.indexOf('?') < 0) return obj;
  let ary = url.split('?')
  url = ary[1];
  ary = url.split('&');
  for(let i = 0; i < ary.length; i++) {
    let cur = ary[i]
    curAry = cur.split('=');
    obj[curAry[0]] = curAry[1];
  }
  return obj;
}

console.log(qureyURLParameter())