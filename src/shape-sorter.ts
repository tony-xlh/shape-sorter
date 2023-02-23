import { Mapping, Polygon, Rectangle } from "./definitions";

export default class ShapeSorter {
  sortPolygons(polygons:Polygon[]): Mapping[] {
    let rectangles:Rectangle[] = [];
    for (let index = 0; index < polygons.length; index++) {
      const polygon = polygons[index];
      rectangles.push(this.convertPolygonToRectangle(polygon));
    }
    return this.sortRectangles(rectangles);
  }
  
  sortRectangles(rectangles:Rectangle[]): Mapping[] {
    return [];
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
      height:maxY - minY
    }
    return rect;
  }
}

export * from "./definitions";