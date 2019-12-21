const spinner = document.getElementById("spinner");
const imgMenu = document.getElementById("imgMenu");

function init() {
  h1 = document.getElementById('codeBox').offsetHeight;
  h2 = document.getElementById('imgContainer').offsetHeight;
  document.getElementById("codeBox").style.maxHeight = "70px";
  document.getElementById("codeBox").style.maxHeight = h1 + 'px';
  document.getElementById("imgContainer").style.maxHeight = h2 + 'px';
}

document.getElementById("rdfRequest").onclick = () => {
  document.getElementById("rdfRequest").setAttribute("hidden", true);
  document.getElementById("refresh").removeAttribute("hidden");
  spinner.removeAttribute("hidden");
  var form = document.getElementById("rdf-options");
  var allElements = form.elements;
  for (var i = 0, l = allElements.length; i < l; ++i) {
    // allElements[i].readOnly = true;
    allElements[i].disabled = true;
  }

  fetch("https://cors-anywhere.herokuapp.com/http://fox.cs.uni-paderborn.de:4444/fox", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      charset: "utf-8"
    },
    body: JSON.stringify(getFields())
  })
    .then(resp => resp.text()) // Transforma output em JSON (pode ser .text)
    .then(function(data) {
      document.getElementById("foxCode").innerText = data;
      hljs.highlightBlock(document.getElementById("foxCode"));
      return fetch("https://cors-anywhere.herokuapp.com/http://www.ldf.fi/service/rdf-grapher", {
        method: "POST",
        body: getImgPayload(data)
      })
        .then(resp => resp.text()) // Transforma output em JSON (pode ser .text)
        .then(function(data) {
          console.log(data);
          // Get SVG from response data, turn into DOM element and change Width and Height to 100% (fill div)
          svg = "<svg " + data.split("<svg")[1];
          var parser = new DOMParser();
          var doc = parser.parseFromString(svg, "image/svg+xml");
          doc.firstChild.attributes.width.nodeValue = "100%";
          doc.firstChild.attributes.height.nodeValue = "100%";
          doc.documentElement.id = "svg";
          // Paste svg onto container
          document.getElementById("imgContainer").appendChild(doc.documentElement);
          imgMenu.removeAttribute("hidden");

          spinner.setAttribute("hidden", "");
        })
        .catch(function(error) {
          console.log("Request error: ", error);
        });
    })
    .catch(function(error) {
      console.log("Request error: ", error);
    });
};

function getImgPayload(data) {
  output = document
    .getElementById("output")
    .options[document.getElementById("output").selectedIndex].getAttribute("data-img");

  let formData = new FormData();
  formData.append("rdf", data);
  formData.append("from", output);
  formData.append("to", "svg");

  return formData;
}

function getFields() {
  // Fields for xml post
  input = document.getElementById("inputArea").value + "";
  type = document.getElementById("type").value + "";
  task = document.getElementById("task").value + "";

  outputSelect = document.getElementById("output");
  output = outputSelect.value + "";
  outputSVG = document
    .getElementById("output")
    .options[document.getElementById("output").selectedIndex].getAttribute("data-img");

  lang = document.getElementById("lang").value + "";
  foxlight = "org.aksw.fox.tools.ner.en." + document.getElementById("foxLight").value;

  payload = { input: input, type: type, task: task, output: output, lang: lang, foxlight: foxlight };
  return payload;
}

function openInNewTab() {
  var svg = document.getElementById("svg");
  console.log(svg);
  var serializer = new XMLSerializer();
  var svg_blob = new Blob([serializer.serializeToString(svg)], { type: "image/svg+xml" });
  var url = URL.createObjectURL(svg_blob);

  // var win = window.open(url, "_blank");
  // win.focus();

  var tab = window.open("about:blank", "_blank");
  tab.document.write(svg.outerHTML); // where 'html' is a variable containing your HTML
  tab.document.close(); // to finish loading the page
}

function saveImg() {
  var svgData = document.getElementById("svg").outerHTML;
  var svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = "rdf-execution.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
