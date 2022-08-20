styles:BaseStyle[] = [
    //this is an array of BaseStyle objects from Figma
    //could contain TextStyle, PaintStyle, and EffectStyle types
    //each style contains a unique key
]

themeData = [
    {name: 'dark/warningDark', theme: 'dark', key: 'uniqueKey'},
    {name: 'dark/warning', theme: 'dark', key: 'uniqueKey'},
    {name: 'light/warningDark', theme: 'light', key: 'uniqueKey'},
    {name: 'light/warning', theme: 'light', key: 'uniqueKey'}
]

uniqueThemes:string[] = ['dark','light']

function returnMatchingStyle(name:string):BaseStyle {
    //recieves


}