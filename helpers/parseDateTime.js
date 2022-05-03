const parseDateTime = (date) => {
    let yy = date.getFullYear()
    
    let mm = date.getMonth()
    mm = (parseInt(mm) < 10 ? "0" + mm : mm) 
    
    let dd = date.getDay()
    dd = (parseInt(dd) < 10 ? "0" + dd : dd) 
    
    let h = date.getHours()
    h = (parseInt(h) < 10 ? "0" + h : h) 
    
    let m = date.getMinutes()
    m = (parseInt(m) < 10 ? "0" + m : m) 
    
    let s = date.getSeconds()
    s = (parseInt(s) < 10 ? "0" + s : s)

    return `${yy}-${mm}-${dd} ${h}:${m}:${s}`;
}


module.exports = parseDateTime;
