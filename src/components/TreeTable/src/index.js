import { isArray } from 'lodash';
import treeToArray from './eval';
import '../style/style.scss';

export default {
    name: 'VeTreeTable',
    props: {
        data: {
            type: [Array, Object],
            required: true
        },
        treeColumnProps: {
            type: Object
        },
        columns: {
            type: Array,
            default: () => []
        },
        evalProp: {
            type: Object,
            default: () => ({ children: 'children', identifier: 'id' })
        },
        evalFunc: Function,
        expandAll: {
            type: Boolean,
            default: false
        }
    },
    render() {
        return (
            <el-table data={this.formatData} rowStyle={this.showRow} {...{ attrs: this.$attrs }}>
                {this.columns.length === 0 ? (
                    <el-table-column
                        width={150}
                        {...{
                            attrs: this.treeColumnProps,
                            scopedSlots: {
                                default: ({ row, column, $index }) => (
                                    <span>
                                        {row._path.split('-').map(item => (
                                            <span key={item} class={'ve-tree-table__space'} />
                                        ))}
                                        {this.iconShow(row) ? (
                                            <span
                                                class={'ve-tree-table__ctrl'}
                                                vOn:click={this._toggleExpanded.bind(this, $index)}
                                            >
                                                {row._expanded ? (
                                                    <i class={'el-icon-minus'} />
                                                ) : (
                                                    <i class={'el-icon-plus'} />
                                                )}
                                            </span>
                                        ) : null}
                                        {this.$scopedSlots.tree
                                            ? this.$scopedSlots.tree({ row, column, $index, data: this.data })
                                            : this.treeColumnProps && this.treeColumnProps.prop
                                            ? row[this.treeColumnProps.prop]
                                            : $index}
                                    </span>
                                )
                            }
                        }}
                    />
                ) : null}
                {this.columns &&
                    this.columns.map(({ type, ...props }) =>
                        type === 'tree' ? (
                            <el-table-column
                                width={150}
                                renderHeader={this.renderHeader}
                                {...{
                                    attrs: props,
                                    scopedSlots: {
                                        default: ({ row, column, $index }) => (
                                            <span>
                                                {row._path.split('-').map(item => (
                                                    <span key={item} class={'ve-tree-table__space'} />
                                                ))}
                                                {this.iconShow(row) ? (
                                                    <span
                                                        class={'ve-tree-table__ctrl'}
                                                        vOn:click={this._toggleExpanded.bind(this, $index)}
                                                    >
                                                        {row._expanded ? (
                                                            <i class={'el-icon-minus'} />
                                                        ) : (
                                                            <i class={'el-icon-plus'} />
                                                        )}
                                                    </span>
                                                ) : null}
                                                {this.$scopedSlots.tree
                                                    ? this.$scopedSlots.tree({
                                                          row,
                                                          column,
                                                          $index,
                                                          data: this.data
                                                      })
                                                    : props && props.prop
                                                    ? row[props.prop]
                                                    : $index}
                                            </span>
                                        )
                                    }
                                }}
                            />
                        ) : (
                            <el-table-column type={type} {...{ attrs: props }} />
                        )
                    )}
                {this.$slots.default}
                <template slot="empty">{this.$slots.empty}</template>
                <template slot="append">{this.$slots.append}</template>
            </el-table>
        );
    },
    computed: {
        // 格式化数据源
        formatData: function() {
            let tmp;
            if (!isArray(this.data)) {
                tmp = [this.data];
            } else {
                tmp = this.data;
            }
            const func = this.evalFunc || treeToArray;
            const args = [tmp, { ...this.evalProp, expandAll: this.expandAll }];
            return func.apply(this, args);
        }
    },
    methods: {
        showRow: function({ row }) {
            const show = row._parent ? row._parent._expanded && row._parent._show : true;
            /* eslint-disable no-param-reassign*/
            row._show = show;
            return show ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;' : 'display:none;';
        },
        /**
         * @public
         * @param row
         */
        toggleExpanded(row) {
            const record = this.formatData.find(item => item._id === row._id);
            record._expanded = !record._expanded;
        },
        // 切换下级是否展开
        _toggleExpanded: function(trIndex) {
            const record = this.formatData[trIndex];
            record._expanded = !record._expanded;
        },
        // 图标显示
        iconShow(record) {
            return record[this.evalProp.children] && record[this.evalProp.children].length > 0;
        }
    }
};
