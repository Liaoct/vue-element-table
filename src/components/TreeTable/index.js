import VeTreeTable from './src/index';

VeTreeTable.install = function(Vue) {
    Vue.component(VeTreeTable.name, VeTreeTable);
};

const install = function(Vue) {
    VeTreeTable.install(Vue);
};

export { install, VeTreeTable };

export default {
    install
};
