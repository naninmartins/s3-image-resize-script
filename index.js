var S3 = require('aws-sdk/clients/s3');
const download = require('image-downloader');
const sharp = require('sharp');
const fs = require('fs');

var s3 = new S3();

const PARAMS = {

  Bucket: "ichurch", 
  MaxKeys: null,
  Prefix:"product/",
 };

const  DESTINATION_OUTPUT_FOLDER = '/home/ernani/Projects/s3-sdk-sample/imgs_Temp/';
const IMG_KEY = 'product/0ead98b0-7f8b-4811-a896-8762d9f01a7c/image/b718a74f8e1c175b7646c04f6b1b6f7b.jpg';

 initialize = () => {

  getImgObjectList();
  // getAllFilesNameFromPath();
  // resizeImg('/home/ernani/Projects/s3-sdk-sample/imgs_Temp/b718a74f8e1c175b7646c04f6b1b6f7b.jpg');  
 }

getImgObjectList = () => {

  
  s3.listObjectsV2(PARAMS, function(err, data) {

    if (err) console.log(err, err.stack); // an error occurred
    else {
      data.Contents.forEach((img) =>{
          getImgUrl(img.Key)
      })
    }
    
  });

}

getImgUrl = (imageKey) => {
  
  let paramsUrl = {Bucket: PARAMS.Bucket,  Key: imageKey};
  let url = s3.getSignedUrl('getObject', paramsUrl);
  downloadImg(url, imageKey);
};


downloadImg = (url, imageKey) => {

  const options = {
    url: `${url}`,
    dest: DESTINATION_OUTPUT_FOLDER,                
  }
  
  async function downloadAsync() {
    try {
      const { filename, image } = await download.image(options)
      console.log('File saved at',filename);
      // console.log("Calling resizeImg and replace after that");

      // resizeImg(filename, imageKey)

    } catch (e) {
      console.error(e)
    }
  }
  
  downloadAsync() 
}

resizeImg =  (filePath, imgKey) => {
  
  sharp(filePath)
    .resize()
    .toBuffer()
    .then(buffer => {
      replaceImgOnS3(buffer, imgKey);
    })
  
}

replaceImgOnS3 = (resizedImgBuffer, imgKey) => {

  const params = {
    Body: resizedImgBuffer,
    Key: imgKey,
    Bucket: PARAMS.Bucket
  }

  s3.putObject(params, function(err, data) {
    if (err) console.log(err, err.stack); 
    else     console.log(data);          
  });

}

getAllFilesNameFromPath = () => {

  fs.readdirSync(DESTINATION_OUTPUT_FOLDER).forEach(file => {
    console.log(file);
  });
}

initialize();
