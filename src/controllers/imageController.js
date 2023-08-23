const path = require("path");
const fs = require("fs");

const getImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    console.log(fileName);
    const imagePath = path.join(__dirname, "/../../public/upload/", fileName);
    res.sendFile(imagePath);
  } catch (error) {
    res.send(error);
  }
};

//image storing
const storeImage = async (req, res) => {
  try {
    let sampleFile;
    let uploadPath;
    const { files } = req;
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    // name of the input is sampleFile ( for us its 'file')
    // sampleFile = files.sampleFile;
    sampleFile = files.file;
    const { fileName } = req;
    uploadPath = __dirname + "/../../public/upload/" + fileName;
    // Use mv() to place file on the server
    sampleFile.mv(uploadPath, function (err) {
      console.log(err, "err");
      if (err) return res.status(500).send(err);
      return res.status(200).send("Success");
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("Bad Request");
    const filePath = path.join(__dirname, "/../../public/upload", image);
    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).send("Internal error");
      next();
    });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

module.exports = { getImage, storeImage, deleteImage };
