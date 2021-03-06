import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NCBService } from '../../../services/ncb.service';
import { Router } from '@angular/router';
import { Helper } from '../../../helper';
import { AppSettings } from '../../../app.settings';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { NgbModal, NgbModalRef, NgbDateStruct, NgbDatepickerConfig, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'banner-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  providers: [NCBService, Helper]
})
export class CreateComponent implements OnInit {
  mRatesDateS: NgbDateStruct;
  mRatesDateS_7: NgbDateStruct;
  my: any = new Date();
  my_7: any = new Date();
  dataForm: FormGroup;
  submitted = false;
  objUpload: any = {};
  public Editor = ClassicEditor;
  selectedFiles: FileList;
  objFile: any = {};
  fileName: File;
  isLockSave = false;
  tempNameImg: any = '';
  listBanner: any = [
    {
      code: 'HOME_POPUP',
      name: 'Hiển thị popup ở HOME'
    },
    {
      code: 'HOME_BANNER',
      name: 'BANNER ở màn hình home'
    },
    {
      code: 'TOPUP_BANNER',
      name: 'BANNER ở màn hình nạp tiền'
    },
    {
      code: 'PAY_BANNER',
      name: 'BANNER ở màn hình thanh toán dịch vụ'
    },
    {
      code: 'CARD_BANNER',
      name: 'BANNER ở màn hình dịch vụ thẻ'
    },
    {
      code: 'FLASH',
      name: 'FLASH'
    }
  ];
  listShow: any = [
    {
      code: 'Y',
      name: 'Show một lần'
    },
    {
      code: 'N',
      name: 'Show mãi mãi'
    }
  ];
  tempUrl: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private ncbService: NCBService,
    public router: Router,
    private helper: Helper,
  ) { }

  ngOnInit() {
    this.loadDate();
    this.dataForm = this.formBuilder.group({
      bannerCode: ['HOME_POPUP', Validators.compose([Validators.required, this.helper.noWhitespaceValidator])],
      bannerName: ['', Validators.compose([Validators.required, this.helper.noWhitespaceValidator])],
      linkImg: [''],
      // linkUrlVn: [''],
      linkUrlEn: [''],
      scheduleStart: [this.mRatesDateS],
      scheduleEnd: [this.mRatesDateS_7],
      oneTimeShow: ['Y'],
      actionScreen: ['', Validators.compose([Validators.required, this.helper.noWhitespaceValidator])],
      status: 'A'
    });
  }
  get Form() { return this.dataForm.controls; }
  tranferDate(params) {
    return params.year + '/' + params.month + '/' + params.day;
  }
  public loadDate(): void {
    this.my_7.setDate(this.my_7.getDate() - 7);
    this.mRatesDateS = { year: this.my_7.getFullYear(), month: this.my_7.getMonth() + 1, day: this.my_7.getDate() };
    this.mRatesDateS_7 = { year: this.my.getFullYear(), month: this.my.getMonth() + 1, day: this.my.getDate() };
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.dataForm.invalid) {
      return;
    }
    const payload = {
      bannerCode: this.dataForm.value.bannerCode,
      bannerName: this.dataForm.value.bannerName,
      linkImg: this.dataForm.value.linkImg,
      // linkUrlVn: this.dataForm.value.linkUrlVn,
      scheduleStart: this.helper.tranferDate(this.dataForm.value.scheduleStart),
      scheduleEnd: this.helper.tranferDate(this.dataForm.value.scheduleEnd),
      linkUrlEn: this.dataForm.value.linkUrlEn,
      oneTimeShow: this.dataForm.value.oneTimeShow,
      status: this.dataForm.value.status,
      actionScreen: this.dataForm.value.actionScreen
    };
    this.ncbService.createNcbBanner(payload).then((result) => {
      if (result.status === 200) {
        if (result.json().code === '00') {
          this.toastr.success('Thêm thành công', 'Thành công!');
          setTimeout(() => {
            this.router.navigateByUrl('/banner');
          }, 500);
        } else if (result.json().code === '908') {
          this.toastr.error('Dữ liệu đã tồn tại', 'Thất bại!');
        } else {
          this.toastr.error(result.json().message, 'Thất bại!');
        }
      } else {
        this.toastr.error(result.message, 'Thất bại!');
      }
    }).catch((err) => {
      this.toastr.error(err.json().message, 'Thất bại!');
    });
  }
  resetForm() {
    this.router.navigateByUrl('/banner');
  }
  async handleFileInput(files: FileList, eventTemp): Promise<any> {
    const check = await this.helper.validateFileImage(
      files[0], AppSettings.UPLOAD_IMAGE.file_size, AppSettings.UPLOAD_IMAGE.file_ext
    );
    if (eventTemp.target.files && eventTemp.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(files[0]); // read file as data url
      this.tempNameImg = files[0].name;
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.tempUrl = (<FileReader>event.target).result;
      };
    }

    if (check === true) {
        this.uploadFile(files.item(0));
    }
  }
  uploadFile(value) {
    this.objUpload = {};
    this.ncbService.uploadFileBanner(value).then((result) => {
      if (result.status === 200) {
        if (result.json().code !== '00') {
          this.isLockSave = true;
          this.toastr.error(result.json().message, 'Thất bại!');
        } else {
          this.objFile = result.json().body;
          this.dataForm.patchValue({
            linkImg: this.objFile.linkUrl,
            // linkUrlVn: this.objFile.linkUrl,
            linkUrlEn: this.objFile.linkUrl,
          });
          this.isLockSave = false;
          this.toastr.success('Upload ảnh thành công', 'Thành công!');
        }
      } else {
        this.isLockSave = true;
        this.toastr.error(result.message, 'Thất bại!');
      }

    }).catch((err) => {
      this.isLockSave = true;
      this.toastr.error(err.json().message, 'Thất bại!');

    });
  }
}


