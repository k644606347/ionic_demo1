import {
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonDatetime,
    IonToast,
} from "@ionic/react";
import React, { useCallback } from "react";
import { useLocalStore, observer } from "mobx-react";
import { observable, extendObservable, action } from "mobx";
import $ from "jquery";
import { request } from "../services/BaseService";
import { AnyObject } from "../utils/types";
import _ from "lodash";
import CancelablePromise, {
    isCancelablePromise,
} from "../utils/CancelablePromise";
import { isPlainObject } from "../utils/Is";
import { isAjaxError } from "../services/$AjaxError";
import dayjs from 'dayjs';

type PackageInfo = {
    downloads: number;
    package: string;
    start: string;
    end: string;
};

type SearchInfo = {
    status: "idle" | "processing" | "done" | "fail" | 'notFound';
    msg?: string;
};

enum DateFormat {
    Search = 'YYYY-MM-DD',
    Pick = 'YYYY-MM-DD',
    Show = 'YYYY-MM-DD',
}
class NpmStatListStore {
    // @observable searchKey = "";
    // @observable searchList: PackageInfo[] = [];
    searchKey = "";
    searchStartDate = dayjs().format(DateFormat.Search);
    searchEndDate = dayjs().add(1, 'date').format(DateFormat.Search);
    searchList: PackageInfo[] = [];

    constructor() {
        extendObservable(this, {
            searchKey: this.searchKey,
            searchStartDate: this.searchStartDate,
            searchEndDate: this.searchEndDate,
            searchList: this.searchList,
            searchInfo: this.searchInfo,
            setSearchKey: this.setSearchKey,
            search: this.search,
            setSearchList: this.setSearchList,
            setSearchInfo: this.setSearchInfo,
        });
    }

    // @observable
    searchInfo: SearchInfo = {
        status: "idle",
        msg: "",
    };

    // @action
    setSearchInfo(searchInfo: this["searchInfo"]) {
        this.searchInfo = searchInfo;
    }
    private _searchPromise?: CancelablePromise<PackageInfo[]>;

    // @action
    search(searchKey = this.searchKey) {
        const startDate = this.searchStartDate,
            endDate = this.searchEndDate,
            searchKeys = searchKey.split(/\s|,|，/).filter(Boolean);

        if (isCancelablePromise(this._searchPromise)) {
            this._searchPromise.cancel();
        }

        this.setSearchInfo({ status: "processing" });

        return (this._searchPromise = request<
            PackageInfo | { [k in string]: PackageInfo | null }
        >({
            url: `https://api.npmjs.org/downloads/point/${startDate}:${endDate}/${searchKeys.join(
                ","
            )}`,
        })
            .then(
                (res) => {
                    let searchList: NpmStatListStore["searchList"] = [];

                    if (searchKeys.length === 1) {
                        searchList.push(res as PackageInfo);
                    } else {
                        searchList = Object.values(res).filter(Boolean);
                    }
                    // debugger;
                    this.setSearchList(searchList);

                    this.setSearchInfo({ status: "done" });
                    return this.searchList;
                }
            )
            .catch((err: unknown) => {
                console.log(err);

                if (isAjaxError(err)) {
                    if (err.$xhr.status === 404) {
                        this.setSearchInfo({ status: 'notFound', msg: `未找到${searchKey}` });
                    } else {
                        this.setSearchInfo({ status: "fail", msg: err + '' });
                    }
                } else {
                    this.setSearchInfo({ status: "fail", msg: err + '' });
                }

                return [];
            }));
    }

    // @action
    setSearchKey(searchKey: this["searchKey"]) {
        this.searchKey = searchKey;
    }

    // @action
    setSearchList(searchList: this["searchList"]) {
        this.searchList = searchList;
    }

    setSearchDate({ startDate, endDate }: { startDate?: NpmStatListStore['searchStartDate']; endDate?: NpmStatListStore['searchEndDate']}) {
        if (startDate) 
            this.searchStartDate = startDate;
        if (endDate) 
            this.searchEndDate = endDate;
    }

    searchDebounce = _.debounce(this.search, 1000);
}

export default observer(function NpmStatList() {
    const store = useLocalStore(() => new NpmStatListStore());

    return (
        <>
            <SearchToolBar store={store}></SearchToolBar>
            <List store={store}></List>
        </>
    );
});

const SearchToolBar = observer(function SearchToolBar({ store }: { store: NpmStatListStore }) {
    const { searchInfo, searchStartDate, searchEndDate } = store;
    return <>
        <IonDatetime
            placeholder={'起始日期'}
            value={searchStartDate}
            displayFormat={DateFormat.Show}
            pickerFormat={DateFormat.Pick}
            disabled={searchInfo.status === 'processing'}
            onIonChange={(e) => {
                const val = e.detail.value && dayjs(e.detail.value).format(DateFormat.Search);


                console.log('startDate', val, e.detail.value);
                if (val) {
                    store.setSearchDate({ startDate: val });
                    store.search();
                }
            }}
        ></IonDatetime>
        <IonDatetime
            placeholder={'截止日期'}
            value={searchEndDate}
            displayFormat={DateFormat.Show}
            pickerFormat={DateFormat.Pick}
            disabled={searchInfo.status === 'processing'}
            onIonChange={(e) => {
                const val = e.detail.value && dayjs(e.detail.value).format(DateFormat.Search);


                console.log('endDate', val, e.detail.value);
                if (val) {
                    store.setSearchDate({ endDate: val });
                    store.search();
                }
            }}
        ></IonDatetime>
        <IonSearchbar
            placeholder="请输入包名，逗号/空格分隔多个"
            debounce={1000}
            animated
            value={store.searchKey}
            disabled={searchInfo.status === 'processing'}
            onIonChange={useCallback((e) => {
                let val = e.detail.value || "";
                store.setSearchKey(val);
                store.search();
            }, [store])}
        ></IonSearchbar>
    </>
});

const List = observer(function List({ store }: { store: NpmStatListStore }) {
    const { searchList, searchInfo, searchKey } = store,
        { status, msg } = searchInfo;

    if (status === 'fail') {
        return <IonItem color="danger">{msg}</IonItem>;
    } else if (status === 'processing') {
        return <>
            {store.searchInfo.status === "processing" && (
                <IonProgressBar type="indeterminate"></IonProgressBar>
            )}
            <IonItem>{msg || '加载中...'}</IonItem>
        </>;
    } else if (status === 'notFound') {
        return <IonItem style={{ color: '#ccc' }}>{msg || `未找到${searchKey}`}</IonItem>
    } else
        return <IonList>
            {searchList.map((item, i) => {
                return (
                    <IonItem key={i}>
                        <IonLabel
                            style={{
                                maxWidth: '100vw',
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>包名</span><span>{item.package}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>下载量</span><span>{item.downloads}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>起始时间</span><span>{item.start}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>截止时间</span><span>{item.end}</span></div>
                        </IonLabel>
                        {/* <IonLabel>{item.package}</IonLabel> */}
                    </IonItem>
                );
            })}
        </IonList>
});
