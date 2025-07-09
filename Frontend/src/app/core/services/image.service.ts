import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
}

export interface MultipleUploadResponse {
  urls: string[];
}

export interface DeleteImageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/upload-image`,
      formData
    );
  }

  uploadMultipleImages(files: File[]): Observable<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.http.post<MultipleUploadResponse>(
      `${this.apiUrl}/upload-images`,
      formData
    );
  }

  deleteImage(imageUrl: string): Observable<DeleteImageResponse> {
    return this.http.delete<DeleteImageResponse>(
      `${this.apiUrl}/delete-image`,
      {
        body: { imageUrl },
      }
    );
  }

  deleteMultipleImages(imageUrls: string[]): Observable<DeleteImageResponse[]> {
    const deletePromises = imageUrls.map((url) =>
      this.deleteImage(url).toPromise()
    );
    return new Observable((observer) => {
      Promise.all(deletePromises)
        .then((responses) => {
          observer.next(responses as DeleteImageResponse[]);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
