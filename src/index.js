import { VeTable, VeTableSync } from './components/VueElementTable';
import { VeTreeTable } from './components/TreeTable';

const install = function(Vue) {
    VeTable.install(Vue);
    VeTableSync.install(Vue);
    VeTreeTable.install(Vue);
};

export { install, VeTable, VeTableSync, VeTreeTable };

export default {
    install
};
