import { Mapping, Polygon, Rectangle } from "./definitions";

export default class ShapeSorter {
  sortPolygons(polygons:Polygon[]): Mapping[] {
    console.log(polygons);
    let rectangles:Rectangle[] = [];
    for (let index = 0; index < polygons.length; index++) {
      const polygon = polygons[index];
      rectangles.push(this.convertPolygonToRectangle(polygon));
    }
    return this.sortRectangles(rectangles);
  }
  
  sortRectangles(rectangles:Rectangle[]): Mapping[] {
    rectangles.sort((a, b) => (a.x**2 + a.y**2) - (b.x**2 + b.y**2))
    console.log(rectangles);
    let lines = this.getLines(rectangles);
    console.log(lines);
    return this.getMappingsFromRectangles(this.getRectangesFromLines(lines));
  }

  getRectangesFromLines(lines:Rectangle[][]):Rectangle[]{
    let rectangles:Rectangle[] = [];
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      rectangles = rectangles.concat(line);
    }
    return rectangles;
  }

  getLines(rectangles:Rectangle[]):Rectangle[][] {
    let lines = [];
    while (rectangles.length > 0) {
      let rect = rectangles[0];
      let clustered = this.clusterRectanglesToOneLine(rectangles,rect);
      if (clustered) {
        lines.push(clustered);
      } else {
        lines.push([rect]); //single rectangle as a line
      }
      rectangles.shift(); //delete the base rect
    }
    lines.sort((a, b) => (a[0].y - b[0].y));
    return lines;
  }

  clusterRectanglesToOneLine(rectangles:Rectangle[],baseRect:Rectangle):Rectangle[]|undefined{
    let line = [];
    for (let index = rectangles.length - 1; index >= 1; index--) { // start from the second element
      const rect = rectangles[index];
      if (this.rectanglesInOneLine(baseRect,rect)) {
        line.push(rect);
        rectangles.splice(index, 1); //delete the rectangle
      }
    }
    if (line.length>0) {
      line.push(baseRect);
      line.sort((a, b) => (a.x - b.x));
      return line;
    }else{
      return undefined;
    }
  }

  rectanglesInOneLine(r1:Rectangle, r2:Rectangle) {
    let y = Math.max(r1.y, r2.y);
    let maxY1 = r1.y + r1.height;
    let maxY2 = r2.y + r2.height;
    let intersectH = Math.min(maxY1, maxY2) - y;
    if (intersectH>0) {
      return true;
    }else{
      return false;
    }
  }
    

  getMappingsFromRectangles(rectangles:Rectangle[]): Mapping[] {
    let mappings:Mapping[] = [];
    for (let index = 0; index < rectangles.length; index++) {
      const rect = rectangles[index];
      if (rect.mapping) {
        mappings.push(rect.mapping);
      }
    }
    return mappings;
  }

  convertPolygonToRectangle(polygon:Polygon):Rectangle{
    let minX:number;
    let minY:number;
    let maxX:number;
    let maxY:number;
    minX = polygon.points[0].x;
    minY = polygon.points[0].y;
    maxX = 0;
    maxY = 0;
    for (let index = 0; index < polygon.points.length; index++) {
      const point = polygon.points[index];
      minX = Math.min(minX,point.x);
      minY = Math.min(minY,point.y);
      maxX = Math.max(maxX,point.x);
      maxY = Math.max(maxY,point.y); 
    }
     
    const rect:Rectangle = {
      x:minX,
      y:minY,
      width: maxX-minX,
      height:maxY - minY,
      mapping:polygon.mapping
    }
    return rect;
  }
}

export * from "./definitions";