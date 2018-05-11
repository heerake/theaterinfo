let _internalContainer_: InternalContainer;

export const createContainer = c => {
  if (!!_internalContainer_) {
    throw new Error('page-store-form container cann\'t be initialized more then once.');
  }
  _internalContainer_ = c;
}

export const getContainer = () => _internalContainer_;
