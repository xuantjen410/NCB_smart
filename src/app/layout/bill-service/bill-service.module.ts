import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { BillServiceRoutingModule } from './bill-service.routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PageHeaderModule } from '../../shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
    imports: [
        CommonModule, BillServiceRoutingModule, PageHeaderModule, NgbModule,
        NgxPaginationModule,
        TranslateModule.forChild(),
        FormsModule, ReactiveFormsModule,
        SweetAlert2Module.forRoot({
            buttonsStyling: false,
            customClass: 'modal-content',
            confirmButtonClass: 'btn btn-primary',
            cancelButtonClass: 'btn'
        }),
        OrderModule
    ],
    declarations: [
        ListComponent, CreateComponent, EditComponent
    ]
})
export class BillServiceModule {}
