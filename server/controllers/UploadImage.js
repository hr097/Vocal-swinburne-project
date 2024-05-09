const {drive}= require("../middlewares/GoogleDriveAPI");
const fs = require("fs");

const UploadImage=async (req,res)=>{
    try{

        // uploading image in drive
        const imageFileName = `image_${Date.now()}.png`;

        const fileMetadata = {
            name: imageFileName,
            parents: ['1YA1Na9MxtKD1QuR4Fw4s5cgP0Y3ArSj2'],
        };

        const media = {
            mimeType: 'image/png',
            body: fs.createReadStream(req.file.path),
        };

        const uploadedFile = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        
        const driveFileId = uploadedFile.data.id;
        
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting local file:', err);
            }
        });
        return res.status(200).json(driveFileId);
    }
    catch(err){
        return res.status(500).json({
            message:err.message,
            app_status:false
        })
    }
}

module.exports={UploadImage};