import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { NCBService } from '../../../services/ncb.service';
import { ToastrService } from 'ngx-toastr';
import { OrderPipe } from 'ngx-order-pipe';
import { NgbModal, NgbModalRef, NgbDateStruct, NgbTabChangeEvent, NgbTooltipConfig, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'banner-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
    providers: [NCBService]
})
export class ListComponent implements OnInit {
    search_keyword: any = '';
    isSearch: any = false;
    isProcessLoad: any = 0;
    totalSearch: any = 0;
    listBanner: any = [
        {
            code: '',
            name: 'Tất cả'
        },
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
    re_search = {
        bannerCode: '',
        bannerName: '',
        status: '',
        size: 10,
        page: 0,
        previous_page: 0
    };

    selectProvine: any;
    listData: any = [];
    listProvinceName: any = [];
    listPageSize: any = [10, 20, 30, 40, 50];
    listStatus: any = [
        {
            name: 'Tất cả',
            code: ''
        },
        {
            name: 'Active',
            code: 'A'
        },
        {
            name: 'Deactive',
            code: 'D'
        }
    ];
    imageShow: any = '';
    protected modalOp: NgbModalRef;

    @ViewChild('showImage', { static: false }) showImageElementRef: ElementRef;


    order: string = 'bannerName';
    reverse: boolean = false;

    sortedCollection: any[];

    constructor(
        private ncbService: NCBService,
        public toastr: ToastrService,
        private modalService: NgbModal,
        private orderPipe: OrderPipe
    ) { 
        this.sortedCollection = orderPipe.transform(this.listData, 'bannerName');
    }

    ngOnInit() {
        this.getListData(this.re_search);
    }
    setOrder(value: string) {
        if (this.order === value) {
          this.reverse = !this.reverse;
        }
    
        this.order = value;
      }

    getListData(params) {
        this.listData = [];
        this.isProcessLoad = 1;
        // xu ly
        this.ncbService
            .searchNcbBanner(params)
            .then(result => {
                setTimeout(() => {
                    const body = result.json().body;
                    this.listData = body.content;
                    this.totalSearch = body.totalElements;
                    this.isProcessLoad = 0;
                }, 300);
            })
            .catch(err => {
                this.isProcessLoad = 0;
                this.listData = [];
                this.totalSearch = 0;
                this.toastr.error('Không lấy được danh sách dữ liệu. Vui lòng liên hệ khối Công nghệ để được hỗ trợ', 'Lỗi hệ thống!');
            });
    }

    deleteItem(event, index, id) {
        Swal.fire({
            title: 'Bạn có chắc chắn xoá?',
            text: 'Dữ liệu đã xoá không thể khôi phục lại',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Không, trở lại'
        }).then(result => {
            if (result.value) {
                this.ncbService.deleteNcbBanner({ id: id }).then((res) => {
                    // this.listData.splice(index, 1);
                    if (res.json().code === '00') {
                        Swal.fire('Đã xoá!', 'Dữ liệu đã xoá hoàn toàn.', 'success');
                        this.getListData(this.re_search);
                    } else {
                        this.toastr.error('Không thể xoá dự liệu', 'Thất bại');
                    }
                });
                // For more information about handling dismissals please visit
                // https://sweetalert2.github.io/#handling-dismissals
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire('Huỷ bỏ', 'Dữ liệu được bảo toàn :)', 'error');
            }
        });
    }
    cancelAction(event) {
        console.log('huy bo thanh con');
    }
    loadPage(page: number) {
      const page_number = page - 1;
      if (page_number !== this.re_search.previous_page) {
        this.re_search.page = page_number;
        this.re_search.previous_page = page_number;
        this.getListData(this.re_search);
        this.re_search.page = page;
      }
    }
    onSearch(payload) {
        if (payload.bannerCode !== '' || payload.bannerName !== '' || payload.status !== '') {
            payload.page = 0;
        }
        this.getListData(payload);
    }
    // keyDownFunction(event) {
    //   if (event.keyCode === 13) {
    //     this.isSearch = false;
    //     this.re_search.cityCode = this.re_search_keyword;
    //     this.getListData(this.re_search);
    //   }
    // }
    changePageSize() {
        this.re_search.page = 0;
        this.getListData(this.re_search);
    }
    openModal(content, classLayout = '', type = '') {
        if (type === 'static') {
          this.modalOp = this.modalService.open(content, { keyboard: false, backdrop: 'static', windowClass: classLayout, size: 'lg' });
        } else if (type === 'sm') {
          this.modalOp = this.modalService.open(content, { windowClass: classLayout, size: 'sm' });
        } else {
          this.modalOp = this.modalService.open(content, { windowClass: classLayout, size: 'lg' });
        }
        this.modalOp.result.then((result) => {
        }, (reason) => {
        });
    }
    closeModal() {
        this.modalOp.close();
    }
    async modalShowImage(image) {
    // tslint:disable-next-line:no-unused-expression
        this.getImageShow(image);
        this.openModal(this.showImageElementRef, 'modal-showimage', 'sm');
    }
    getImageShow(image) {
        this.imageShow = image;
    }
}
