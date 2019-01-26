import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ImageUploadService {

  constructor(private http: HttpClient) {}

  public uploadImage(routeForImageUpload: string, image: File): Observable< string | any> {
    const formData = new FormData();

    formData.append('image', image);

    return this.http.post(routeForImageUpload, formData)
        .pipe(map(((json: any) => json.imageUrl)));
  }

}
