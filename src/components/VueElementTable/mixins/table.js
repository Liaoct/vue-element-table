import { merge } from 'lodash';
import '../style/index.scss';

const DefaultPaginationProps = {
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper'
};

export default {
    inheritAttrs: false, // 未被识别为props的属性，将不会出现在根元素上
    props: {
        layout: {
            type: String,
            default: 'tool, table, pagination'
        },
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        actionColumn: {
            type: Object,
            default() {
                return {};
            }
        },
        currentPage: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 10
        },
        paginationProps: {
            type: Object,
            default() {
                return {};
            }
        },
        columns: {
            type: Array,
            default: () => []
        }
    },
    render() {
        const layoutMap = {
            tool: this.toolBarShow ? <div class={'ve-table__tool'}>{this.$slots['tool']}</div> : null,
            table: (
                <el-table
                    ref="elTable"
                    data={this.curTableData}
                    {...{
                        attrs: this.$attrs,
                        on: this.$listeners,
                        directives: this._server ? [{ name: 'loading', value: this.innerLoading }] : undefined
                    }}
                    class={'ve-table__table'}
                >
                    {this.columns && this.columns.map(prop => <el-table-column {...{ attrs: prop }} />)}
                    {this.$slots.default}
                    <template slot="empty">{this.$slots.empty}</template>
                    <template slot="append">{this.$slots.append}</template>
                    {this.actionColumnShow ? (
                        <el-table-column
                            prop={this.actionColumnProp}
                            {...{
                                attrs: this.innerActionColumn.props,
                                scopedSlots: {
                                    default: scope => {
                                        return (
                                            <div class="action-list">
                                                {this.innerActionColumn.buttons.map(button => {
                                                    let buttonProps = Object.assign(
                                                        {
                                                            type: button.type || 'text',
                                                            icon: button.icon
                                                        },
                                                        button.props
                                                    );

                                                    let clickHandler = function() {
                                                        button.handler(
                                                            scope.row,
                                                            scope.column,
                                                            scope.$index,
                                                            scope.store
                                                        );
                                                    };

                                                    return (
                                                        <span>
                                                            <el-button
                                                                onClick={clickHandler}
                                                                {...{ attrs: buttonProps }}
                                                            >
                                                                {button.label}
                                                            </el-button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                }
                            }}
                        />
                    ) : null}
                </el-table>
            ),
            pagination: this.paginationShow ? (
                <el-pagination
                    ref="elPagination"
                    class={'ve-table__pagination'}
                    background
                    {...{
                        attrs: this.innerPaginationProps,
                        on: {
                            'size-change': this.handleSizeChange,
                            'prev-click': this.handlePrevClick,
                            'next-click': this.handleNextClick,
                            'current-change': this.handleCurrentChange
                        }
                    }}
                    current-page={this.innerCurrentPage}
                    page-size={this.innerPageSize}
                    total={this.innerTotal}
                    class={'ve-table__pagination'}
                >
                    {this.$slots.pagination}
                </el-pagination>
            ) : null
        };
        return <div class="ve-table">{this.layouts.map(layout => layoutMap[layout])}</div>;
    },
    data() {
        return {
            innerCurrentPage: 1,
            innerPageSize: 10,
            actionColumnProp: 'e6e4c9de-7cf5-4f19-bb73-838e5182a372',
            innerPaginationProps: {}
        };
    },
    computed: {
        layouts() {
            return this.layout.split(',').map(item => item.trim());
        },
        innerActionColumn() {
            let { label, ...actionColumn } = this.actionColumn;

            return merge(
                {
                    show: true,
                    buttons: [],
                    props: {
                        label: label || '操作'
                    }
                },
                actionColumn
            );
        },
        paginationShow() {
            return this.layouts.includes('pagination');
        },
        actionColumnShow() {
            return this.innerActionColumn.buttons.length > 0;
        },
        toolBarShow() {
            return this.layouts.includes('tool') && this.$slots.tool;
        }
    },
    methods: {
        handleSizeChange(size) {
            this.innerPageSize = size;
            this.$emit('size-change', size);
            this.$emit('pagination-change', { pageSize: size, currentPage: this.innerCurrentPage });
        },
        handlePrevClick(page) {
            this.$emit('prev-click', page);
        },
        handleNextClick(page) {
            this.$emit('next-click', page);
        },
        handleCurrentChange(page) {
            this.innerCurrentPage = page;
            this.$emit('current-page-change', page);
            this.$emit('pagination-change', { pageSize: this.innerPageSize, currentPage: page });
        }
    },
    watch: {
        // make innerCurrentPage and innerPageSize as data,
        // and watch currentPage to update innerCurrentPage, pageSize to update innerPageSize
        // at the same time watch innerCurrentPage and innerPageSize to emit sync emit.
        // the two watch cannot be replaced by computed getter and setter here,
        // because currentPage and pageSize can be not provided(undefined).
        pageSize: {
            immediate: true,
            handler(val) {
                this.innerPageSize = val;
            }
        },
        innerPageSize(val) {
            this.$emit('update:pageSize', val);
        },
        currentPage: {
            immediate: true,
            handler(val) {
                this.innerCurrentPage = val;
            }
        },
        innerCurrentPage(val) {
            this.$emit('update:currentPage', val);
        },
        paginationProps: {
            immediate: true,
            handler(val) {
                if (this.paginationShow) {
                    this.innerPaginationProps = Object.assign({}, DefaultPaginationProps, val);

                    if (this.innerPaginationProps.pageSizes.indexOf(this.innerPageSize) === -1) {
                        console.warn(
                            `[ve-table]: pageSize ${this.innerPageSize} is not included in pageSizes[${
                                this.innerPaginationProps.pageSizes
                            }], set pageSize to pageSizes[0]: ${this.innerPaginationProps.pageSizes[0]}`
                        );
                        this.innerPageSize = this.innerPaginationProps.pageSizes[0];
                    }
                } else {
                    this.innerPageSize = this.curTableData.length;
                }
            }
        }
    }
};
