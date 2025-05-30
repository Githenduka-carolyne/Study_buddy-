import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient();

// get topHost
export const topHosts =async(req, res)=>{
   try{
    const topHosts = await prisma.users.find()
            .sort({ activityScore: -1 })
            .limit(10);
        res.status(200).json(topHosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}