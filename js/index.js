console.log('here')

document.getElementById("goApi").onclick = () => {
  console.log("fetch data...");
  fetch("http://fox.cs.uni-paderborn.de:4444/fox", {
    method: "POST",
    headers: {
      "charset": "utf-8",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": '*'
    },
    body: JSON.stringify({
      input: "Leipzig is the capital of the world!",
      lang: "en",
      type: "text",
      task: "ner",
      output: "JSON-LD"
    })
  })
    .then(function(response) {
      //return response.json();
      console.log(response.json())
    })
    .then(function(json) {
      console.log("Request succeeded with JSON response:", json);
    })
    .catch(function(error) {
      console.log("Request failure: ", data);
    });
};

// function sendPost() {
//   fetch("http://fox.cs.uni-paderborn.de:4444/fox", {
//     method: "POST",
//     headers: {
//       charset: "utf-8",
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       input: "Leipzig is the capital of the world!",
//       lang: "en",
//       type: "text",
//       task: "ner",
//       output: "JSON-LD"
//     })
//   })
//     .then(function(data) {
//       console.log("Request success: ", data);
//     })
//     .catch(function(error) {
//       console.log("Request failure: ", data);
//     });
// }
