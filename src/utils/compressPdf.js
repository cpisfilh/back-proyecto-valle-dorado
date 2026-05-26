import fs from "fs";
import { exec } from "child_process";

export const compressPdf = (
  inputPath,
  outputPath
) => {

  return new Promise(
    (resolve, reject) => {

      const gsCommand =
        process.platform === "win32"
          ? "gswin64c"
          : "gs";

      const command = `
        ${gsCommand}
        -sDEVICE=pdfwrite
        -dCompatibilityLevel=1.4
        -dPDFSETTINGS=/ebook
        -dNOPAUSE
        -dQUIET
        -dBATCH
        -sOutputFile="${outputPath}"
        "${inputPath}"
      `.replace(/\n/g, " ");

      exec(command, (error) => {

        if (error) {
          reject(error);
          return;
        }

        if (
          !fs.existsSync(outputPath)
        ) {
          reject(
            new Error(
              "No se generó PDF comprimido"
            )
          );

          return;
        }

        resolve(outputPath);
      });
    }
  );
};
