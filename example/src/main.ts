import "./styles.css";
import { BarcodeReader, TextResult } from "dynamsoft-javascript-barcode";
import ShapeSorter, {Mapping, Point, Polygon, Rectangle } from "./shape-sorter";

let reader:BarcodeReader;
let img:HTMLImageElement;
let results:TextResult[];

window.onload = function(){
  console.log("loaded");
  let barcodeFile = document.getElementById('barcodeFile') as HTMLInputElement;
  barcodeFile.addEventListener("change",function(){
    loadImageFromFile();
  })
  let decodeButton = document.getElementById('decodeButton') as HTMLButtonElement;
  decodeButton.addEventListener("click",function(){
    console.log("decode");
    decodeImg();
  })
  let sortButton = document.getElementById('sortButton') as HTMLButtonElement;
  sortButton.addEventListener("click",function(){
    console.log("sort");
    sortTextResults();
  })
}

async function initDBR(){
  let status = document.getElementById("status") as HTMLElement;
  status.innerText = "initializing...";
  BarcodeReader.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-javascript-barcode@9.6.10/dist/";
  BarcodeReader.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
  reader = await BarcodeReader.createInstance();
  status.innerText = "";
}

function loadImageFromFile() { 
  console.log("loadImageFromFile");
  let barcodeFile = document.getElementById('barcodeFile') as HTMLInputElement;
  let files = barcodeFile.files as FileList;
  if (files.length == 0) {
    return;
  }
  let file = files[0];
  let fileReader = new FileReader();
  fileReader.onload = function(e:any){
    loadImage(e.target.result);
  };
  fileReader.onerror = function () {
    console.warn('oops, something went wrong.');
  };
  fileReader.readAsDataURL(file);
}

function loadImage(imgsrc:string){
  if (imgsrc) {
    img = new Image();
    img.src = imgsrc;
    img.onload = function(){
      let svgElement = document.getElementById("resultSVG") as HTMLElement;
      svgElement.innerHTML = "";
      let svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      svgImage.setAttribute("href",imgsrc);
      svgElement.setAttribute("viewBox","0 0 "+img.width+" "+img.height);
      svgElement.appendChild(svgImage);
    }
  }
}

async function decodeImg(){
  if (!img) {
    return;
  }
  let status = document.getElementById("status") as HTMLElement;
  status.innerText = "decoding...";
  if (!reader) {
    await initDBR();
  }
  results = await reader.decode(img);
  console.log(results);
  overlayResults(results);
  status.innerText = "";
}

function overlayResults(results:TextResult[]){
  let svgElement = document.getElementById("resultSVG") as HTMLElement;
  clearElements(svgElement,"a");
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    let a = document.createElementNS("http://www.w3.org/2000/svg","a");
    let polygon = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    polygon.setAttribute("points",getPointsAttributeFromResult(result));
    polygon.setAttribute("class","barcode-polygon");
    let title = document.createElementNS("http://www.w3.org/2000/svg","title");
    title.textContent = result.barcodeFormatString + ": " + result.barcodeText;
    const rect = getRectangleFromResult(result);
    const center:Point =  {x:rect.x+rect.width/2,y:rect.y+rect.height/2};
    let text = document.createElementNS("http://www.w3.org/2000/svg","text");
    let fontSize = 25;
    text.setAttribute("x",(center.x - fontSize/2).toString());
    text.setAttribute("y",center.y.toString());
    text.classList.add("order");
    text.style.fontSize = fontSize.toString();
    text.textContent  = (i + 1).toString();
    polygon.append(title);
    a.append(polygon);
    a.append(text);
    svgElement.append(a);
  }
}

function getRectangleFromResult(result:TextResult):Rectangle{
  let minX,minY,maxX,maxY;
  minX = result.localizationResult.x1;
  minY = result.localizationResult.y1;
  maxX = 0;
  maxY = 0;
  for (let index = 1; index <= 4; index++) {
    const lr = result.localizationResult as any;
    const x = lr["x"+index];
    const y = lr["y"+index];
    minX = Math.min(minX,x);
    minY = Math.min(minY,y);
    maxX = Math.max(maxX,x);
    maxY = Math.max(maxY,y);
  }
  const rect:Rectangle = {
    x:minX,
    y:minY,
    width: maxX-minX,
    height:maxY - minY
  }
  return rect;
}

function getPolygonFromResult(result:TextResult,index:number):Polygon{
  const point1:Point = {x:result.localizationResult.x1,y:result.localizationResult.y1};
  const point2:Point = {x:result.localizationResult.x2,y:result.localizationResult.y2};
  const point3:Point = {x:result.localizationResult.x3,y:result.localizationResult.y3};
  const point4:Point = {x:result.localizationResult.x4,y:result.localizationResult.y4};
  const polygon:Polygon = {points:[point1,point2,point3,point4],mapping:{originalIndex:index}};
  return polygon;
}

function getPointsAttributeFromResult(result:TextResult) {
  let value = "";
  value = value + result.localizationResult.x1 + " " + result.localizationResult.y1 + " ";
  value = value + result.localizationResult.x2 + " " + result.localizationResult.y2 + " ";
  value = value + result.localizationResult.x3 + " " + result.localizationResult.y3 + " ";
  value = value + result.localizationResult.x4 + " " + result.localizationResult.y4 + " ";
  return value.trim();
}

function clearElements(parent:HTMLElement,tagName:string){
  let elements=parent.getElementsByTagName(tagName);
  while (elements.length>0){
    let ele=elements[0];
    ele.remove();
  }
}

function sortTextResults(){
  let horizontal = (document.getElementById("horizontal") as HTMLInputElement).checked;
  let sorter = new ShapeSorter();
  sorter.horizontal = horizontal;
  let polygons = polygonsFromTextResults();
  let mappings = sorter.sortPolygons(polygons);
  reorderResultsAndUpdateOverlay(mappings)
}

function polygonsFromTextResults(){
  let polygons = [];
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    polygons.push(getPolygonFromResult(result,index));
  }
  return polygons;
}

function reorderResultsAndUpdateOverlay(mappings:Mapping[]){
  let newResults:TextResult[] = [];
  for (let index = 0; index < mappings.length; index++) {
    const mapping = mappings[index];
    const originalIndex = mapping.originalIndex;
    if (originalIndex != undefined) {
      newResults.push(results[originalIndex]);
    }
  }
  results = newResults;
  overlayResults(results);
}

export {}