export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null
  }

export function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue
  }

export function deleteCookie(cname) {
    document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
}

function formatTime(date) {
  const options = {
      hour: "numeric",
      minute: "numeric"
    };
  const dateTimeFormat = new Intl.DateTimeFormat("en-US", options);
  return dateTimeFormat.format(date)
}

function getDay(date) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return dayNames[date.getDay()]
}

export function formatDate(timestamp) {
  const date = new Date(timestamp)
  return `${getDay(date)}, ${formatTime(date)}`
}

export function getShortDay(date) {
  const dateObj = new Date(date)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return dayNames[dateObj.getDay()]
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}