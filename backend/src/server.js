import express from "express";
import "dotenv/config";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favouritesTable } from './db/schema.js';
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";
const app=express();
const PORT=ENV.PORT || 5001;

if(ENV.NODE_ENV==="production") job.start();
app.use(express.json())
app.listen(PORT,()=>{
    console.log("server is running on port:5001");
});
app.post("/api/favourites",async(req,res)=>{
    try{
      const {userId, recipeId,title,image,cookTime,servings}=req.body;
      if(!userId || !recipeId ||!title)
      {
        return res.status(400).json({error:"Missing Required Fields"});
      }
      const newFavourite=await db.insert(favouritesTable).values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings
      })
      .returning();
      res.status(201).json(newFavourite[0])
    }
    catch(error)
    {
         console.error(error);
        res.status(500).json({error:"something went wrong"});
    }
})
app.delete("/api/favourites/:userId/:recipeId" ,async(req,res)=>{
  try{
            const {userId,recipeId}=req.params;
            await db.delete(favouritesTable).where(
              and (eq(favouritesTable.userId,userId),eq(favouritesTable.recipeId,parseInt(recipeId)))
            )
            res.status(200).json({message:"Favourite Removed Successfully"});
  }
  catch(error)
  {
     console.error(error);
        res.status(500).json({error:"something went wrong"});
  }
})
app.get("/api/favourites/:userId",async(req,res)=>{
  try{

  
     const {userId} =req.params;
     const userFavourites=await db.select().from(favouritesTable).where(eq(favouritesTable.userId,userId))
         res.status(200).json(userFavourites);
    }  catch(error){
  console.error(error);
        res.status(500).json({error:"something went wrong"});
}
}
)
app.get("/api/health",(req,res)=>{
    res.status(200).json({success:true});

})
// {
//     "userId":"123",
//     "recipeId":"456",
//     "title":"yummy chicken",
//     "image":"exampleimage.com",
//     "cookTime":"30mins",
//     "servings":"3"
// }