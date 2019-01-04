import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { ImageUploadComponent } from './image-upload.component';
import { ImageUploadService } from './image-upload.service';
import { MatIconModule } from '@angular/material';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    MatIconModule,
    ImageCropperModule,
  ],
  providers: [
    ImageUploadService,
  ],
  exports: [
    ImageUploadComponent,
  ],
  declarations: [
    ImageUploadComponent,
  ]
})
export class ImageUploadModule {}
