import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicacionesService } from 'src/app/services/publicaciones.service';
import { Publicacion } from 'src/app/models/publicacion'; 
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Storage, ref, listAll, deleteObject   } from '@angular/fire/storage';
import {uploadBytes } from 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-editar-publicacion',
  templateUrl: './editar-publicacion.component.html',
  styleUrls: ['./editar-publicacion.component.css']
})
export class EditarPublicacionComponent implements OnInit{
  publicacion?: Publicacion;
  newImages: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService,
    private storage: Storage,
    private authfirebase: AngularFireAuth
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.publicacionesService.getPublicacion(id).subscribe(publicacion => {
        this.publicacion = publicacion;
      });
    }
  }

  onNewFilesSelected(event: any) {
    this.newImages = event.target.files;
  }



  async onSubmit(form: NgForm) {
    console.log('Form submitted');
    console.log('Form valid:', form.valid);
    console.log('Publication:', this.publicacion);
    if (form.valid && this.publicacion && this.publicacion.id) {
      console.log('Calling updatePublicacion method');
      this.publicacionesService.updatePublicacion(this.publicacion.id, this.publicacion);
      if (this.newImages.length > 0) {
        await this.replaceImages(this.publicacion.id, this.newImages);
      }
    } else {
      console.log('Form valid:', form.valid);
      console.log('this.publicacion:', this.publicacion);
      if (this.publicacion) {
        console.log('this.publicacion.id:', this.publicacion.id);
      }
    }
  }

  async replaceImages(publicacionId: string, newImages: File[]) {
    const user = await this.authfirebase.currentUser
    const storageRef = ref(this.storage, `images/posts/${user?.uid}/${publicacionId}`);
    const existingImages = await listAll(storageRef);
  
    // Eliminar las imágenes existentes
    await Promise.all(existingImages.items.map(item => deleteObject(item)));
  
    // Subir las nuevas imágenes
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i];
      const imgRef = ref(storageRef, file.name);

      try {
        await uploadBytes(imgRef, file);
        console.log('Imagen subida:', file.name);
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }

    console.log('Reemplazo de imágenes completado.');
  }

}