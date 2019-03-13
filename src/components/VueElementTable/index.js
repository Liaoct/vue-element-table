import VeTable from './src/VeTable';
import VeTableSync from './src/VeTableSync';

VeTable.install = function(Vue) {
    Vue.component(VeTable.name, VeTable);
};

VeTableSync.install = function(Vue) {
    Vue.component(VeTable.name, VeTableSync);
};

const install = function(Vue) {
    VeTable.install(Vue);
    VeTableSync.install(Vue);
};

export { install, VeTable, VeTableSync };

export default {
    install
};
