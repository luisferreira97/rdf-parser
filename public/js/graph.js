mxConstants.HIGHLIGHT_COLOR = "#ff0000";

let graph = new mxGraph(document.getElementById("graphContainer"));

// Gets the default parent for inserting new cells. This
// is normally the first child of the root (ie. layer 0).
var graphParent = graph.getDefaultParent();
let entities = null;


function main(container) {
  // Checks if the browser is supported
  if (!mxClient.isBrowserSupported()) {
    mxUtils.error("Browser is not supported!", 200, false);
  } else {
    // Enables tooltips, new connections and panning
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.setConnectable(true);

    // Autosize labels on insert where autosize=1
    graph.autoSizeCellsOnAdd = true;

    // Changes some default colors
    mxConstants.HANDLE_FILLCOLOR = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    mxConstants.HANDLE_STROKECOLOR = "#0088cf";
    mxConstants.VERTEX_SELECTION_COLOR = "#00a8ff";

    // Disables built-in context menu
    mxEvent.disableContextMenu(document.getElementById("graphContainer"));

    // Automatically handle parallel edges
    var layout = new mxParallelEdgeLayout(graph);
    var layoutMgr = new mxLayoutManager(graph);

    layoutMgr.getLayout = function(cell) {
      if (cell.getChildCount() > 0) {
        return layout;
      }
    };

    // Enables rubberband (marquee) selection and a handler
    // for basic keystrokes (eg. return, escape during editing).
    var rubberband = new mxRubberband(graph);
    var keyHandler = new mxKeyHandler(graph);

    // Delete on delete key
    keyHandler.bindKey(46, function(evt) {
      if (graph.isEnabled()) {
        graph.removeCells();
      }
    });

    // Creates the default style for vertices
    var style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_STROKECOLOR] = "#000";
    style[mxConstants.STYLE_ROUNDED] = false;
    style[mxConstants.STYLE_FILLCOLOR] = "#fff";
    style[mxConstants.STYLE_FONTCOLOR] = "#000";
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_FONTSIZE] = "12";
    style[mxConstants.STYLE_FONTSTYLE] = 1;
    graph.getStylesheet().putDefaultVertexStyle(style);

    // Creates the default style for edges
    // "fontSize=12;html=1;endArrow=ERoneToMany;startArrow=ERmandOne;entryX=0.055;entryY=1;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryPerimeter=0;"

    style = [];
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_STROKECOLOR] = "#696969";
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
    style[mxConstants.STYLE_STARTARROW] = "ERmandOne";
    style[mxConstants.STYLE_ENDARROW] = "ERoneToMany";
    style[mxConstants.STYLE_FONTSIZE] = "14";
    style[mxConstants.STYLE_NOLABEL] = 1;
    graph.getStylesheet().putDefaultEdgeStyle(style);
  }
}

document.getElementById("file-upload").onclick = function(event) {
  openFile(function(txt) {
    graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
    const xml = txt;
    try {
      const onlyRoot = xml.slice(xml.search("<root>"), xml.search("</root>") + 7);

      let doc = mxUtils.parseXml(onlyRoot);
      let codec = new mxCodec(doc);
      codec.decode(doc.documentElement, graph.getModel());
      let elt = doc.documentElement.firstChild;
      let cells = [];
      while (elt != null) {
        let cell = codec.decode(elt);
        if (cell != undefined) {
          if (cell.id != undefined && cell.parent != undefined && cell.id == cell.parent) {
            elt = elt.nextSibling;
            continue;
          }
          cells.push(cell);
        }
        elt = elt.nextSibling;
      }
      graph.addCells(cells);
      fitAndCenter();
      updateElements();
    } catch (error) {
      alert("Could not import diagram");
    }
  });
};

// Add New Entity to the Diagram
document.getElementById("addEntity").addEventListener("click", () => {
  // Adds cells to the model in a single step
  graph.getModel().beginUpdate();

  try {
    // Insert new Entity with name "New Entity" on position x = 20 ; y = 20 ; width = 80 ; height = 40
    newEntity = graph.insertVertex(graphParent, null, "Entity", 20, 20, 80, 40);
    // Add new attribute "Cardinality" with initial value 0
    newEntity["cardinality"] = 0;
    // Add new object attribute "source relationships" with all possible relationship types with initial values 0
    newEntity["sourceRelationships"] = { oneToOne: 0, oneToMany: 0, manyToMany: 0 };
    // Add new object attribute "target relationships" with all possible relationship types with initial values 0
    newEntity["targetRelationships"] = { oneToOne: 0, oneToMany: 0, manyToMany: 0 };
  } finally {
    // Updates the display and end the update
    graph.getModel().endUpdate();
  }
});

graph.getModel().addListener(mxEvent.CHANGE, function(sender, evt) {
  // empty table body

  const eTbl = document.getElementById("entityTable").tBodies[0];
  eTbl.innerHTML = "";

  // Get List of Entities
  const relationships = graph.getChildEdges(graph.getDefaultParent());

  // Get List of Entities
  const entities = graph.getChildVertices(graph.getDefaultParent());

  // Get List of Entities
  for (entity in entities) {
    const row = eTbl.insertRow(eTbl.rows.length);

    // Add Entity Value (Entity Name)
    const value = row.insertCell(0);
    value.classList = "align-middle";
    value.innerHTML = entities[entity]["value"];

    // Add Cardinality Input Field with Cardinality Field (create field if not exists)
    const cardinality = row.insertCell(1);
    cardinality.classList = "align-middle";
    cardinality.innerHTML = `
      <input type="number" id="cardinalityInput_${
        entities[entity]["id"]
      }" value="${
      entities[entity]["cardinality"]
    }" oninput="updateCardinality(${entities[entity]["id"]})" min="0">`;

    // UPDATE RELATIONSHIPS OF ENTITY
    entities[entity]["sourceRelationships"]["oneToOne"] = 0;
    entities[entity]["sourceRelationships"]["oneToMany"] = 0;
    entities[entity]["sourceRelationships"]["manyToMany"] = 0;
    entities[entity]["targetRelationships"]["oneToOne"] = 0;
    entities[entity]["targetRelationships"]["oneToMany"] = 0;
    entities[entity]["targetRelationships"]["manyToMany"] = 0;

    for (r in relationships) {
      if (parseInt(relationships[r]["value"]) > 1) {
        console.log("rel has value > 1");
        var style = new Object();
        style[mxConstants.STYLE_NOLABEL] = 0;
        graph.getStylesheet().putCellStyle("showLabel", style);
        graph.getModel().setStyle(relationships[r], "showLabel");
        graph.refresh();
      } else {
        var style = new Object();
        style[mxConstants.STYLE_NOLABEL] = 1;
        graph.getStylesheet().putCellStyle("showLabel", style);
        graph.getModel().setStyle(relationships[r], "showLabel");
        graph.refresh();
      }

      if (relationships[r]["source"]["id"] === entities[entity]["id"]) {
        relType = relationships[r]["relType"];
        entities[entity]["sourceRelationships"][relType] += parseInt(relationships[r]["value"]);
      }
      if (relationships[r]["target"]["id"] === entities[entity]["id"]) {
        relType = relationships[r]["relType"];
        entities[entity]["targetRelationships"][relType] += parseInt(relationships[r]["value"]);
      }
    }

    // Add Number of Incoming relationships By Filtering Every mxEdge that targets the entity
    const srcRelationships = row.insertCell(2);
    srcRelationships.classList = "align-middle";
    srcRelationships.innerHTML = `
      <div class="small">
        <div>
          <span><strong>One to One: </strong></span>
          <span>${entities[entity]["sourceRelationships"]["oneToOne"]}</span>  
        </div>  
        <div>
          <span><strong>One to Many: </strong></span>
          <span>${entities[entity]["sourceRelationships"]["oneToMany"]}</span>  
        </div>  
        <div>
          <span><strong>Many to Many: </strong></span>
          <span>${entities[entity]["sourceRelationships"]["manyToMany"]}</span>  
        </div>  
      </div>
      `;

    // Add Number of Incoming relationships By Filtering Every mxEdge that targets the entity
    const trgRelationships = row.insertCell(3);
    trgRelationships.classList = "align-middle";
    trgRelationships.innerHTML = `
      <div class="small">
        <div>
          <span><strong>One to One: </strong></span>
          <span>${entities[entity]["targetRelationships"]["oneToOne"]}</span>  
        </div>  
        <div>
          <span><strong>One to Many: </strong></span>
          <span>${entities[entity]["targetRelationships"]["oneToMany"]}</span>  
        </div>  
        <div>
          <span><strong>Many to Many: </strong></span>
          <span>${entities[entity]["targetRelationships"]["manyToMany"]}</span>  
        </div>  
      </div>
      `;
  }
});

// Custom Relationship (On Edge Creation Event)
graph.connectionHandler.addListener(mxEvent.CONNECT, function(sender, evt) {
  var edge = evt.getProperty("cell");
  edge["relType"] = "oneToMany";
  edge["value"] = "1";
});

function updateCardinality(entityId) {
  // Find Entity by ID
  const entityToUpdate = graph.getChildVertices().find(obj => {
    return obj.id == entityId;
  });

  // Update Cardinality Value of Entity
  entityToUpdate["cardinality"] = parseInt(document.getElementById(`cardinalityInput_${entityId}`).value);
}

//////////////////////
// Helper Functions //
//////////////////////

function openFile(callBack) {
  var element = document.createElement("input");
  element.setAttribute("type", "file");
  element.setAttribute("id", "btnOpenFile");
  element.onchange = function() {
    readText(this, callBack);
    document.body.removeChild(this);
  };

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();
}

function readText(filePath, callBack) {
  var reader;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    reader = new FileReader();
  } else {
    alert("The File APIs are not fully supported by your browser. Fallback required.");
    return false;
  }
  var output = ""; //placeholder for text output
  if (filePath.files && filePath.files[0]) {
    reader.onload = function(e) {
      output = e.target.result;
      callBack(output);
    }; //end onload()
    reader.readAsText(filePath.files[0]);
  } //end if html5 filelist support
  else {
    //this is where you could fallback to Java Applet, Flash or similar
    return false;
  }
  return true;
}

function fitAndCenter() {
  graph.fit();
  graph.view.rendering = true;
  graph.refresh();
}

function updateElements() {
  entities = graph.getChildVertices(graph.getDefaultParent());
}
