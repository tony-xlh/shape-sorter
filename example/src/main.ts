import "./styles.css";
import { BarcodeReader, TextResult } from "dynamsoft-javascript-barcode";

let reader:BarcodeReader;
let img:HTMLImageElement;

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
  let results = await reader.decode(img);
  console.log(results);
  overlayResults(results);
  status.innerText = "";
}

function overlayResults(results:TextResult[]){
  let svgElement = document.getElementById("resultSVG") as HTMLElement;
  clearElements(svgElement,"polygon");
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    let a = document.createElementNS("http://www.w3.org/2000/svg","a");
    let polygon = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    polygon.setAttribute("points",getPointsAttributeFromResult(result));
    polygon.setAttribute("class","barcode-polygon");
    let title = document.createElementNS("http://www.w3.org/2000/svg","title");
    title.textContent = result.barcodeFormatString + ": " + result.barcodeText;
    polygon.append(title);
    a.append(polygon)
    svgElement.append(a);
  }
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

export {}