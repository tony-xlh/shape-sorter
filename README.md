# shape-sorter

Sort shapes like polygon and rectangle in reading order.

[Online demo which sorts barcodes](https://rainbow-eclair-d18e24.netlify.app/).

## Include the library

1. Via CDN:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/shape-sorter@latest/dist/shape-sorter.umd.js"></script>
   ```
   
2. Via npm:

   ```
   npm install shape-sorter
   ```
   
   
## Usage

Demo:

```js
let rectangles = [
  {x:55,y:105,width:50,height:50,mapping:{originalIndex:0}},
  {x:20,y:55,width:50,height:50,mapping:{originalIndex:1}},
  {x:55,y:55,width:50,height:50,mapping:{originalIndex:2}}
];

let sorter = new ShapeSorter();
let mappings = sorter.sortRectangles(rectangles);
let sorted = [];
for (let index = 0; index < mappings.length; index++) {
  const mapping = mappings[index];
  sorted.push(rectangles[mapping.originalIndex]);
}
console.log(sorted);
//[
//{x: 20, y: 55, width: 50, height: 50, mapping: {originalIndex:1}},
//{x: 55, y: 55, width: 50, height: 50, mapping: {originalIndex:2}},
//{x: 55, y: 105, width: 50, height: 50, mapping: {originalIndex:0}}
//]
```

## Methods

```ts
sortPolygons(polygons: Polygon[]): Mapping[];
sortRectangles(rectangles: Rectangle[]): Mapping[];
```

## Properties

Horizontal: if set to true, cluster shapes in rows. Othersize, cluster shapes in columns.


## Interfaces

```ts
export interface Point {
    x: number;
    y: number;
}
export interface Mapping {
    originalIndex?: number;
    row?: number;
    column?: number;
}
export interface Polygon {
    points: Point[];
    mapping?: Mapping;
}
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    mapping?: Mapping;
}
```