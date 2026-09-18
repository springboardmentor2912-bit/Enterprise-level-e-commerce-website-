const express=require(`express`)
const app=express()
const port=3000;
app.get('/',(req,res)=>{
    console.log(`Hello World!`);
});
app.get('/users',(req,res)=>{
    console.log(`Hello World! Users end point`);
});
app.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});

