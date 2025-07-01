const dayjs = require("dayjs");

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const formatDate = (timestamp, format)=>{
  if(!timestamp) {
    return '';
  }
  return dayjs(timestamp).format(format);
};

module.exports = {capitalizeFirstLetter, formatDate};