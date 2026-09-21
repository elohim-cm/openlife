import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

export default class BusinessGoal{

    static SOUSCRIPTION = 'subscription'
    static COLLECTION = 'collection'

    static columns= t => [
            {name: "label", label: t("label")},
            {name: "value", label: t("value")},
            {name: "nature", label: t("nature")},
            {name: "target", label: t("target")},
            {name: "parent", label: t("parent")},
            // {name: "description", label: t('description')},
            {name: "actions", label: "Actions", filter: false, sort: false},
    ]


    static types = t => {
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);
        const resources = [
            { name: 'network', label: t("network") },
            { name: 'distribution_area', label: t("distributionArea") },
            { name: 'animation_team', label: t("animationTeam") },
            { name: 'provider', label: t("provider") }
        ]
        const code = access?.role?.code

        switch (code) {
            case 'ADMIN':
                return  resources.filter(resource => ['network', 'distribution_area', 'animation_team'].includes(resource.name))
            case 'PDG':
                return  resources.filter(resource => ['network'].includes(resource.name))
            case 'DCOM':
                return  resources.filter(resource => resource.name === 'network')
            case 'INP':
                return  resources.filter(resource => resource.name === 'distribution_area')
            case 'MNG':
                return  resources.filter(resource => resource.name === 'animation_team')
            case 'ANM':
                return  resources.filter(resource => resource.name === 'provider')
            default:
                return resources
        }
    };

    static natures = t => ([
        { name: 'subscription', label: t("subscription") },
        { name: 'collection', label: t("collection") }
    ])

    static canTreat(){
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);
        
        const code = access?.role?.code

        switch (code) {
            case 'ADMIN':
            case 'PDG':
                return ['network', 'distribution_area', 'animation_team']
            case 'DCOM':
                return ['network']
            case 'INP':
                return ['distribution_area']
            case 'MNG':
                return ['animation_team']
            case 'ANM':
                return ['provider']
            default:
                return []
        }
    }


    static async index(token, page='',query='', nature='', code='', perPage='')
    {
        const header = await fetch(`${BASE_URL}/business-goal?page=${page}&q=${query}&nature=${nature}&code=${code}&per_page=${perPage}`, this.#header(token, "GET"))
        const response = await header.json()

        if (header.status !==200) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }

    static async store(token, datas, setErrors)
    {
        setErrors([])
        const header = await fetch(`${BASE_URL}/business-goal`, this.#header(token, "POST", datas))
        const response = await header.json()

        if (header.status === 422) {
            setErrors(Object.values(response.errors).flat())
            throw new Error(response.message|| header.statusText)
        }

        if (header.status !==200 && header.status !== 422 && header.status !== 201) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }

    static async bulkCreate(token, datas, setErrors)
    {
        setErrors([])
        const header = await fetch(`${BASE_URL}/business-goal/bulk`, this.#header(token, "POST", datas))
        const response = await header.json()

        if (header.status === 422) {
            setErrors(Object.values(response.errors).flat())
            throw new Error(response.message|| header.statusText)
        }

        if (header.status === 207) {
            return response
        }

        if (header.status === 400) {
            return response
        }

        if (header.status !==200 && header.status !== 201) {
            return response
        }

        return response
    }

    static async update(token, business_goal, datas, setErrors)
    {
        setErrors([])
        const header = await fetch(`${BASE_URL}/business-goal/${business_goal}`, this.#header(token, "PUT", datas))
        const response = await header.json()

        if (header.status === 422) {
            setErrors(Object.values(response.errors).flat())
            throw new Error(response.message|| header.statusText)
        }

        if (header.status !==200 && header.status !== 422 && header.status !== 201) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }

    static async destroy(token, uuid)
    {
        const header = await fetch(`${BASE_URL}/business-goal/${uuid}`, this.#header(token, "DELETE"))
        const response = await header.json()

        if (header.status !==200) {
            throw new Error(response.message || header.statusText)
        }

        return response.message
    }

    static #header(_token, _method, _datas=null)
    {
        _token = getToken();
        const header = {
            method: _method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${_token}`,
                'X-localization': UtilMethods.getLanguage()
            }
        }
        if (_datas !== null) {
            header.body = JSON.stringify(_datas)
        }
        return header
    }

    static async resources(token, page, queryTag, selectedType, resourceUid='', _qParentFiltering='')
    {
        let endpoint, dataKey, lastEndPoint;
        lastEndPoint = selectedType
        let inListing = 0
        console.log(lastEndPoint, resourceUid)
        switch (selectedType) {
            case 'network':
                endpoint = '/network';
                dataKey = 'networks';
                inListing=1;//to load just network  related to current access
                break;
            case 'distribution_area':
                endpoint = '/distribution-area';
                dataKey = 'distribution_areas';
                inListing=1;//to load just network  related to current access
                break;
            case 'animation_team':
                endpoint = '/animation-team';
                dataKey = 'animation_teams';
                inListing=1;//to load just network  related to current access
                break;
            case 'provider':
                endpoint = '/provider';
                dataKey = 'providers';
                break;
            default:
                throw new Error('Invalid selectedType');
        }

        const result = {}

        const url1 = `${BASE_URL}${endpoint}?page=${page}&q=${queryTag.trim()}&from_business_goal=${inListing}&per_page=1000`;
        const url2 = `${BASE_URL}/business-goal/parent/${selectedType}/${resourceUid}?q=${_qParentFiltering}`;

        const header = await fetch(url1, this.#header(token, 'GET'));
        const response = await header.json();

        if (resourceUid !== ''){
            const header2 = await fetch(url2, this.#header(token, 'GET'));
            const response2 = await header2.json();
            result.data2 = {
                datas: response2.data,
            }

            if (header2.status !== 200) {
                throw new Error(response2.message || header2.statusText || response2.error);
            }
        }

        if (header.status !== 200) {
            throw new Error(response.message || header.statusText || response.error);
        }

        //-------------
        result.data1 = {
            datas: response.data[dataKey],
            pagination: response.data.pagination,
            links: response.data.links
        }
        return result;
    }

    static async show(token, uuid) {
        const header = await fetch(`${BASE_URL}/business-goal/${uuid}`, this.#header(token, "GET"))
        const response = await header.json()

        if (header.status !==200) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }

    static async histories(token,uuid, page, query) {
        const header = await fetch(`${BASE_URL}/business-goal/${uuid}/histories?page=${page}&q=${query}`, this.#header(token, "GET"))
        const response = await header.json()

        if (header.status !==200) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }

    static async getUserOrganizationWithGoals(token) {
        const header = await fetch(`${BASE_URL}/business-goal/user-organization-with-goals`, this.#header(token, "GET"))
        const response = await header.json()

        if (header.status !== 200) {
            throw new Error(response.message || header.statusText)
        }

        return response
    }
}