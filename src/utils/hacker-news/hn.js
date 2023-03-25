import axios from 'axios';

const hnApiBase = 'https://hacker-news.firebaseio.com/v0'

const getTopArticleIds = () => {
  return new Promise((resolve, reject) => { // dumb promise wrapper
    setTimeout(() => {
      axios.get(`${hnApiBase}/topstories.json`)
        .then(res => resolve(res.data.slice(0, 10)))
        .catch(err => reject(err));
    }, 500);
  });
}

const getArticleTopCommentId = (articleId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios.get(`${hnApiBase}/item/${articleId}.json`)
        .then(res => {
          resolve({
            title: res.data.title,
            topCommentId: res.data?.kids
              ? res.data.kids[0]
              : null
          });
        })
        .catch(err => reject(err));
      }, 500);
  });
}

const getArticleTopComment = (kidId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios.get(`${hnApiBase}/item/${kidId}.json`)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => reject(err));
    }, 500); // add delays to avoid hammering HN api
  });
}

// https://stackoverflow.com/a/822464/2710227
const stripHtml = (htmlString) => {
  return htmlString.replace(/<[^>]*>?/gm, '');
}

const removeLinks = (body) => {
  let newStr = "";

  body.split(" ").forEach(str => {
    if (
      str.indexOf('http:') !== -1 ||
      str.indexOf('https:') !== -1 ||
      str.indexOf('www.') !== -1
    ) {
      newStr += "link"
    } else {
      newStr += str;
    }

    newStr += " ";
  });

  return newStr;
}

// https://stackoverflow.com/a/9609450/2710227
const decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

// recursive function
const getHnArticleData = async (articleIds, articleData, promiseResolver) => {
  if (articleIds.length) {
    const articleId = articleIds[0];
    
    console.log(`processing article ${articleId}`);
    const articleTopCommentInfo = await getArticleTopCommentId(articleId);

    const articleTopComment = articleTopCommentInfo.topCommentId
      ? await getArticleTopComment(articleTopCommentInfo.topCommentId)
      : {
        text: 'no comments yet',
      };

    articleData[articleId] = {
      title: articleTopCommentInfo.title, 
      comment: decodeEntities(stripHtml(removeLinks(articleTopComment.text))),
    };

    articleIds.shift();
    getHnArticleData(articleIds, articleData, promiseResolver);
  } else {
    promiseResolver(true);
  }
}

const processHnQueue = async (articleIds, articleData) => {
  return new Promise(resolve => {
    getHnArticleData(articleIds, articleData, resolve);
  });
}

export const getHnTopArticleComments = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const articleIds = await getTopArticleIds();
      const articleData = {};
      await processHnQueue(articleIds, articleData);
      console.log(articleData);
      resolve(articleData);
    } catch (error) {
      reject(error)
    }
  });
}
