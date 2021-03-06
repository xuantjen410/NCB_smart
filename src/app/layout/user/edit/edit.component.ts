import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NCBService } from '../../../services/ncb.service';
import { Helper } from '../../../helper';
import { Router, ActivatedRoute, Params, NavigationEnd } from '@angular/router';

@Component({
  selector: 'edit-user',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  providers: [NCBService, Helper]
})

export class EditComponent implements OnInit {
  dataForm: FormGroup;
  userForm: FormGroup;
  passForm: FormGroup;
  userResetForm: FormGroup;
  submitted = false;
  listPGD: any = [];
  listBranch: any = [];
  listRole: any = [];
  itemId: any = '';
  obj: any = {};
  userInfo: any = [];
  statusUser: any;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private ncbService: NCBService,
    private helper: Helper,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.itemId = params.itemId;
    });
    this.getItem(this.itemId);
    this.userInfo = localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')) : '';
  }

  ngOnInit() {
    this.dataForm = this.formBuilder.group({
      branchCode: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{2,}).)*$/)])],
      transactionCode: [this.listPGD, Validators.compose([Validators.required, Validators.pattern(/^((?!\s{2,}).)*$/)])],
      status: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{2,}).)*$/)])],
      username: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.pattern(/^((?!\s{2,}).)*$/)])],
      // tslint:disable-next-line:max-line-length
      fullName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(2), Validators.pattern(/^((?!\s{2,}).)*$/)])],
      email: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.pattern(/^((?!\s{2,}).)*$/)])],
      phone: ['', Validators.compose([Validators.maxLength(13), Validators.minLength(2), Validators.pattern(/^((?!\s{2,}).)*$/)])],
      roleId: [''],
    });
    this.passForm = this.formBuilder.group({
      status: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{2,}).)*$/)])]
    });
    this.userForm = this.formBuilder.group({
      username: [''],
      oldPassword: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{1,}).)*$/)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{1,}).)*$/)])],
      re_newPassword: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{1,}).)*$/)])],
    }, {
      validator: this.helper.MustMatch('newPassword', 're_newPassword')
    });
    this.userResetForm = this.formBuilder.group({
      username: [''],
      password: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{1,}).)*$/)])],
      re_password: ['', Validators.compose([Validators.required, Validators.pattern(/^((?!\s{1,}).)*$/)])],
    }, {
      validator: this.helper.MustMatch('password', 're_password')
    });
    this.getBranchs();
    this.getListRole();
    // this.getAllPGD();
  }
  get Form() { return this.dataForm.controls; }
  get FormUser() { return this.userForm.controls; }
  get FormPass() { return this.passForm.controls; }
  get FormReset() { return this.userResetForm.controls; }


  getBranchs() {
    this.listBranch = [];
    this.ncbService.getBranchs().then((result) => {
      this.listBranch.push({ code: 0, name: 'Tất cả' });

      result.json().body.forEach(element => {
        this.listBranch.push({
          code: element.brnCode,
          name: element.branchName,
        });
      });

    }).catch((err) => {
      this.toastr.error('Không lấy được dự liệu chi nhánh!', 'Thất bại!');
    });
  }
  async onChangePGD(value) {
    if (value === '') {
      await this.getAllPGD();
    } else {
      await this.getPGD(value);
    }
  }
  getPGD(value) {
    this.listPGD = [];
    this.ncbService.getPGD({brnCode: value}).then((result) => {
      this.listPGD.push({ code: '', name: 'Tất cả' });
      result.json().body.content.forEach(element => {
        this.listPGD.push({
          code: element.departCode,
          name: element.departName,
        });
      });
    }).catch((err) => {
      this.toastr.error('Không lấy được dữ liệu phòng giao dịch', 'Thất bại');
    });
  }
  getAllPGD() {
    this.listPGD = [];
    this.ncbService.getListPGD().then((result) => {
      this.listPGD.push({ code: '', name: 'Tất cả' });
      result.json().body.forEach(element => {
        this.listPGD.push({
          code: element.departCode,
          name: element.departName,
        });
      });
    }).catch((err) => {
      this.toastr.error('Không lấy được dữ liệu phòng giao dịch', 'Thất bại');
    });
  }
  getListRole() {
    this.listRole = [];
    this.ncbService.searchRoles({
      status: 'A',
      roleName: '',
      page: 1,
      size: 1000
    }).then((result) => {
      result.json().body.content.forEach(element => {
        this.listRole.push({
          code: element.roleId,
          name: element.roleName,
        });
      });
    }).catch((err) => {
      this.toastr.error('Không lấy được dữ liệu phân quyền!', 'Thất bại!');
    });
  }
  getItem(params) {
    this.ncbService.detailUser(params).then((result) => {
      const body = result.json().body.content;
      this.dataForm.patchValue({
        branchCode: body.branchCode,
        transactionCode: body.transactionCode,
        fullName: body.fullName,
        status: body.status === 'A' ? true : false,
        phone: body.phone,
        email: body.email,
        username: body.userName,
        roleId: body.role.roleId
      });
      this.userResetForm.patchValue({
        username: body.userName
      });
      this.userForm.patchValue({
        username: body.userName
      });
      this.passForm.patchValue({
        status: body.status === 'A' ? true : false,
      });
      this.getPGD(this.dataForm.value.branchCode);
    }).catch(err => {
      this.toastr.error(err.json().message, 'Thất bại!');
    });
  }
  changeStatus(event) {
    this.statusUser = event.currentTarget.checked === true ? 'A' : 'D';
  }
  onSubmitResetPW() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.userResetForm.invalid) {
        return;
    }
    const payload = {
      password: this.userResetForm.value.password
    };
    this.ncbService.updateResetPassword(this.dataForm.value.username , payload).then((result) => {
      if (result.json().code === '00') {
        this.toastr.success('Thay đổi mật khẩu thành công', 'Thành công!');
        setTimeout(() => {
          this.router.navigateByUrl('/user');
        }, 500);
      } else {
        this.toastr.error('Thay đổi mật khẩu thất bại', 'Thất bại!');
      }
    }).catch((err) => {


    });
  }
  onSubmitPassW() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.userForm.invalid) {
        return;
    }
    const payload = {
      username: this.dataForm.value.username,
      oldPassword: this.userForm.value.oldPassword,
      newPassword: this.userForm.value.newPassword
    };
    this.ncbService.updatePassword(payload).then((result) => {
      if (result.json().code === '00') {
        this.toastr.success('Thay đổi mật khẩu thành công', 'Thành công!');
        setTimeout(() => {
          this.router.navigateByUrl('/user');
        }, 500);
      } else if (result.json().code === '405') {
        this.toastr.error('Mật khẩu cũ không chính xác', 'Thất bại!');
      } else {
        this.toastr.error('Thay đổi mật khẩu thất bại', 'Thất bại!');
      }
    }).catch((err) => {


    });
  }
  onSubmitStatus() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.passForm.invalid) {
        return;
    }
    const payload = {
      username: this.dataForm.controls.username.value,
      status: this.statusUser
    };
    this.ncbService.updateStatusUser(payload).then((result) => {
      if (result.json().code !== '00') {
        this.toastr.error('Có lỗi xảy ra!', 'Thất bại!');
        return;
      }
      this.toastr.success('Sửa thành công', 'Thành công!');
      setTimeout(() => {
        this.router.navigateByUrl('/user');
      }, 500);
    }).catch((err) => {
      this.toastr.error(err, 'Thất bại!');

    });
  }
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.dataForm.invalid) {
        return;
    }
    delete this.dataForm.value['status'];
    const payload = {
      branchCode: this.dataForm.value.branchCode,
      transactionCode: this.dataForm.value.transactionCode,
      username: this.dataForm.value.username,
      fullName: this.dataForm.value.fullName,
      email: this.dataForm.value.email,
      phone: this.dataForm.value.phone,
      roleId: parseInt(this.dataForm.value.roleId)
    };
    this.ncbService.updateUser(payload).then((result) => {
      if (result.json().code !== '00') {
        this.toastr.error('Có lỗi xảy ra!', 'Thất bại!');
        return;
      }
      this.toastr.success('Sửa thành công', 'Thành công!');
      setTimeout(() => {
        this.router.navigateByUrl('/user');
      }, 500);

    }).catch((err) => {


    });
  }
  resetForm() {
    this.router.navigateByUrl('/user');
  }
}
