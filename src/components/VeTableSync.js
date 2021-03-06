import { isArray, debounce, isFunction, get } from 'lodash';
import Axios from 'axios';
import Table from '../mixins/table';

export default {
  name: 'VeTableSync',
  mixins: [Table],
  props: {
    total: {
      type: Number
    },
    loading: {
      type: Boolean,
      default: false
    },
    httpRequest: {
      type: [Function, Object]
    },
    propsMap: {
      type: Object,
      default: () => ({
        data: 'data',
        total: 'total',
        pageSize: 'pageSize',
        currentPage: 'currentPage'
      })
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      innerLoading: false,
      curTableData: [],
      innerTotal: 0
    };
  },
  created() {
    this._server = true;
    // 避免发起重复请求
    // 当pageSize变化，并且引起currentPage变化时，可以避免重复发起请求
    this.handleHttpRequest = debounce(this.handleHttpRequest, 10);

    if (this.httpRequest) {
      this.handleHttpRequest();
    }
  },
  methods: {
    _httpRequest({ pageSize, currentPage, ...other }) {
      const queryInfo = {
        [this.propsMap.pageSize]: pageSize,
        [this.propsMap.currentPage]: currentPage,
        ...other
      };
      if (isFunction(this.httpRequest)) return this.httpRequest(queryInfo);
      const options = { method: 'get', ...this.httpRequest };
      if (options.method === 'get') {
        options.params = Object.assign({}, options.params || {}, queryInfo);
      } else {
        options.data = Object.assign({}, options.data || {}, queryInfo);
      }

      return Axios(options).then(res => {
        if (res.status === 200) return res.data;
      });
    },
    handleHttpRequest({ pageSize, currentPage, ...other } = {}) {
      this.innerLoading = true;

      const payload = {
        pageSize: pageSize || this.innerPageSize,
        currentPage: currentPage || this.innerCurrentPage,
        ...this.params,
        ...other
      };
      Promise.resolve(this._httpRequest(payload))
        .then(val => {
          // 当请求返回时，当前页已经改变（一般出现在快速切换分页时），不做处理
          const isCurrent =
            payload.pageSize === this.innerPageSize && payload.currentPage === this.innerCurrentPage;
          if (!isCurrent) return;
          if (isArray(val)) {
            this.curTableData = val;
          } else {
            this.curTableData = get(val, this.propsMap.data, []);
            this.innerTotal = this.propsMap.total
              ? parseInt(get(val, this.propsMap.total, this.innerTotal))
              : this.innerTotal;
          }
          this.innerLoading = false;
        })
        .catch(() => (this.innerLoading = false));
    },
    /**
     * @public
     */
    doRequest(params) {
      this.handleHttpRequest(params);
    },
    /**
     * @override
     */
    handleSizeChange(size) {
      if (this.httpRequest) {
        this.handleHttpRequest({ pageSize: size });
      }
      this.innerPageSize = size;
    },
    /**
     * @override
     */
    handleCurrentChange(page) {
      if (this.httpRequest) {
        this.handleHttpRequest({ currentPage: page });
      }
      this.innerCurrentPage = page;
    }
  },
  watch: {
    loading(val) {
      this.innerLoading = val;
    },
    data: {
      deep: true,
      immediate: true,
      handler(val) {
        this.curTableData = val;
      }
    },
    total: {
      immediate: true,
      handler(val) {
        let totalPage = val / this.innerPageSize;
        let ceilTotalPage = Math.ceil(totalPage);
        if (ceilTotalPage >= this.innerCurrentPage) {
          this.innerTotal = val;
        } else {
          const curTotal = this.innerPageSize * this.innerCurrentPage;
          console.warn(
            `[ve-table]: total ${val} less than ${curTotal} (pageSize*currentPage, ${this.innerPageSize}*${this.innerCurrentPage}), set total to ${curTotal}`
          );
          this.innerTotal = curTotal;
        }
      }
    }
  }
};
