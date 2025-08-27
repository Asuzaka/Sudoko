type rows = number[]
type sudoko = rows[]

export class Sudoko {
 
  // Not gonna make logic in class, but i would do that for OOP, but not in case when frontend is involved.

  public generateRandomArrayOfGame (): sudoko {
    // rules
    // #1 : No repeating in a row (1-9)
    // #2 : No repeating in a column (1-9)
    // #3 : No repeating in a block (3x3) validateCubes

    let s:sudoko = [this.generateRandomArray()]

    for(let i=0; i < Infinity;i++){
      let newrow:rows = this.generateRandomArray()
      if(this.validateArrayofGame([...s, newrow])){
        s.push(newrow)
      }


      // if the lenght is 9 then we can break and return array
      if(s.length === 9) {
        console.log(`attemps: ${i}`)
        break;
      }
    }
    
    return s


    // Personal comments

    // first concern was how to return? alike the stucture? i could alike return
    // an array of rows [[1-9], [1-9]] or other way around columns, i could also
    // return cubes(3x3) e.g: [[1,2,3, !2row: 4,5,7 ...]] and last option was
    // returning just 81 numbers in a a single array [(1-9)x9]
  }


  private generateRandomArray(): rows {
   // static array of row
   let a = [1,2,3,4,5,6,7,8,9];

   for (let i = 0; i < 9; i++) {
    let d = Math.floor(Math.random() * (9 - i)); // pick random index from remaining
    let c = a.splice(d, 1)[0];                   // remove that element
    a.push(c);                                   // put it at the end of the same array
   }

   return a;

   // Personal comments
   
   // first i idea was just to randomazi and check if there is no same number in array of row,
   // but that would be expensive. so i came up with better idea of having static array and creating new
   // by taking and deleting from it randomly. but later then i end up just shuffling. 
  }

  private validateArrayofGame(s:sudoko):boolean {
   // rows
   for (const i of s){
      if (!this.validateRows(i)) return false
   }
   // validateColumns
   if(!this.validateColumns(s)) return false
   // cubes (3x3)
   if(!this.validateCubes(s)) return false
   return true
   // Personal comments
  }

  private validateRows(r:rows):boolean{
    
    let a = new Set()
    
    for (const i of r){
      a.add(i)
    }

    return a.size === 9

    // Personal comments
    
    // too loops would work but too much expensive, came up with better idea of using Set.
  }

  private validateColumns(s:sudoko):boolean{
    
    for (let i = 0; i < 9; i++) {
      // iteration by columns 
      let a = new Set()
      for (let k = 0; k < s.length; k++) {
        a.add(s[k][i])
      }

      if(a.size !== s.length) return false
    }
      
    return true 
      
    // Personal comments
      
    // naturally sudoko array has an array of rows, so there is always 9 columns.
  }

  private validateCubes(s: sudoko): boolean {
    
    // Loop over each box (9 total: 3 rows × 3 cols of boxes)

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
       let a = new Set<number>();

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRow * 3 + r;
            const col = boxCol * 3 + c;
            if (row < s.length) {          // check only filled rows
             const val = s[row][col];
             if (a.has(val)) return false; // duplicate inside cube
             a.add(val);
           }
          }
        }
      }
    }
    return true;
  } 
}
