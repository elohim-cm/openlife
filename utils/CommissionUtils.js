export const getVerb = (_util, _t) => {
    if (_util.isTechnicalReferent()) {
        return _t('approve')
    } else if (_util.isPDG()) {
        return _t('validate')
    } else if (_util.isTresearer()) {
        return _t('pay')
    }
}

export const getTitle = (_util, _t, _indicator = false) => {
    if (_util.isTechnicalReferent()) {
        return _t('approbationCommission')
    } else if (_util.isPDG()) {
        return _t('validationCommission')
    } else if (_util.isTresearer()) {
        if (_indicator) {
            return _t('regularizeCommission')
        } else {
            return _t('paymentCommission')
        }
    }
}

export const getContent = (_util, _t, _indicator = false) => {
    if (_util.isTechnicalReferent()) {
        return _t('areYouSureApproveCommission')
    } else if (_util.isPDG()) {
        return _t('areYouSureValidateCommission')
    } else if (_util.isTresearer()) {
        if (_indicator) {
            return _t('areYouSureRegularizeCommission')
        } else {
            return _t('areYouSurePayCommission')
        }
    }
}

export const statusForCommissions = {
    'TECH': 'approval',
    'PDG': 'validation',
    'TRE': 'payment',
}
