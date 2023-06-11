import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { CatchErrorException } from 'src/exceptions';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { SUPPORTED_FILE_TYPES } from './file.constant';
import {
  getAzureContainerName,
  getFileExtention,
  getFormattedFileName,
} from './file.util';
@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}
  async getBlobClient(
    imageName: string,
    containerName: string,
  ): Promise<BlockBlobClient> {
    const connectionString = this.configService.get<string>(
      'azure.storage.connectionString',
    );
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(imageName);
    return blobClient;
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException(
          'File to uppload is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const extention = file.mimetype.split('/')[1];
      if (!SUPPORTED_FILE_TYPES.includes(extention)) {
        throw new HttpException(
          `File type not supported allow file types are ${SUPPORTED_FILE_TYPES.join(
            ', ',
          )}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const containerName = getAzureContainerName(extention);
      const fileName = getFormattedFileName(file.originalname);
      const blobClient = await this.getBlobClient(fileName, containerName);
      await blobClient.uploadData(file.buffer);
      return { fileName };
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async readFile(fileName: string) {
    try {
      const extention = getFileExtention(fileName);
      const containerName = getAzureContainerName(extention);
      const blobClient = await this.getBlobClient(fileName, containerName);
      const blobDownloaded = await blobClient.download();
      return blobDownloaded.readableStreamBody;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundException('File Not found');
      } else {
        throw new CatchErrorException(error);
      }
    }
  }

  async deleteFile(fileName: string) {
    try {
      const extention = getFileExtention(fileName);
      const containerName = getAzureContainerName(extention);
      const blobClient = await this.getBlobClient(fileName, containerName);
      const res = await blobClient.deleteIfExists();
      if (!res.succeeded) {
        throw new HttpException(
          'File not successfully deleted try again later',
          HttpStatus.CONFLICT,
        );
      }
      return new ResponseMessage('File successfully deleted');
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
