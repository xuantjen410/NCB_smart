import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { PackageRoutingModule } from './package.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
    imports: [
        CommonModule, PackageRoutingModule, PageHeaderModule, NgbModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        CKEditorModule,
        SweetAlert2Module.forRoot({
            buttonsStyling: false,
            customClass: 'modal-content',
            confirmButtonClass: 'btn btn-primary',
            cancelButtonClass: 'btn'
        }),
        CurrencyMaskModule,
        OrderModule
    ],
    declarations: [
        ListComponent, CreateComponent, EditComponent
    ]
})
export class PackageModule {}
