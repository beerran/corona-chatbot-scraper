import { Region, RegionConverter } from '../models/region';
import { Risk, RiskConverter } from '../models/risk';
import { FohmScraper } from '../scrapers/fohm.scraper';
import { BaseModel, IndexedBaseModel } from './../models/base-model';
import { Converter, Suggestion } from './../models/suggestion';
import { DataService } from './data.service';

export class FohmService {
    private scrapers: {type: 'risk' | 'regions' | 'suggestions', timeout: NodeJS.Timeout} [] = [];
    private regionService: DataService<Region>;
    private riskService: DataService<Risk>;
    private suggestionService: DataService<Suggestion>;
    constructor() {
        this.regionService = new DataService<Region>('regions', RegionConverter);
        this.riskService = new DataService<Risk>('risk', RiskConverter);
        this.suggestionService = new DataService<Suggestion>('suggestions', Converter);
    }

    public setupScraper(type: 'risk' | 'regions' | 'suggestions') {
        switch (type) {
            case 'risk':
                this.setupRiskScraper().then(() => {
                    const interval = setInterval(async () => {
                        await this.setupRiskScraper();
                    }, parseInt(process.env.POLLING_TIME_RISK as string, 10));
                    this.scrapers = [...this.scrapers, {type: 'risk', timeout: interval}];
                });
            break;
            case 'regions':
                this.setupRegionScraper().then(() => {
                    const interval = setInterval(async () => {
                        await this.setupRegionScraper();
                    }, parseInt(process.env.POLLING_TIME_REGIONS as string, 10));
                    this.scrapers = [...this.scrapers, {type: 'regions', timeout: interval}];
                })
            break;
            case 'suggestions':
                this.setupSuggestionScraper().then(() => {
                    const interval = setInterval(async () => {
                        await this.setupSuggestionScraper();
                    }, parseInt(process.env.POLLING_TIME_SUGGESTIONS as string, 10));
                    this.scrapers = [...this.scrapers, {type: 'suggestions', timeout: interval}];
                })
            break;
        }
    }

    private async setupSuggestionScraper() {
        const suggestions = await FohmScraper.scrapeSuggestions();
        if (suggestions && suggestions.length > 0) {
            const existing = await this.suggestionService.getAll();
            await this.checkForListUpdates(existing, suggestions, this.suggestionService);
        }
        console.log(`suggestions scrape done, running again in ${process.env.POLLING_TIME_SUGGESTIONS}ms`);
    }

       private async setupRegionScraper() {
        const regions = await FohmScraper.scrapeRegions();
        if (regions && regions.length > 0) {
            const existing = await this.regionService.getAll();
            await this.checkForListUpdates(existing, regions, this.regionService);
        }
        console.log(`regions scrape done, running again in ${process.env.POLLING_TIME_REGIONS}ms`);
    }

    private async setupRiskScraper() {
        const risk = await FohmScraper.scrapeRisk();
        if (risk) {
            const existing = await this.riskService.getAll();
            await this.checkForSingleUpdate(existing[0], risk, this.riskService);
        }
        console.log(`risk scrape done, running again in ${process.env.POLLING_TIME_RISK}ms`);
    }

    private async checkForListUpdates<T extends IndexedBaseModel>(existingList: T[], fetchedList: T[], service: DataService<T>): Promise<void> {
        if (existingList && existingList.length > 0 && fetchedList && fetchedList.length > 0) {
            existingList.forEach(async existing => {
                const fetched = fetchedList.find(f => f.index === existing.index);
                if (fetched) {
                    if (existing && fetched) {
                        const result = this.loopKeys(fetched, existing);
                        if (result.keys !== result.matches) {
                            console.log(fetched);
                            console.log('-- UPDATING TO --');
                            console.log(existing);

                            const id = {...existing}.id;
                            existing = {...fetched, id};

                            await service.update(existing);
                            return;
                        } else {
                            return;
                        }
                    }
                    else {
                        await service.create(fetched);
                        return;
                    }
                }
            })
        } else if (fetchedList) {
            fetchedList.forEach(async fetched => await service.create(fetched));
            return;
        }
    }

    private async checkForSingleUpdate<T extends BaseModel>(existing: T, fetched: T, service: DataService<T>): Promise<void> {
        if (existing && fetched) {
            const result = this.loopKeys(fetched, existing);
            if (result.keys !== result.matches) {
                console.log(existing);
                console.log('-- UPDATING TO --');
                console.log(fetched);

                const id = {...existing}.id;
                existing = {...fetched, id};
                await service.update(existing);
                return;
            } else {
                return;
            }
        }
        await service.create(fetched);
        return;
    }

    private loopKeys(fetched: any, existing: any): {matches: number, keys: number} {
        let matchesFound = 0,
            keysFound = 0;
        Object.keys(fetched).forEach(key => {
            keysFound++;
            if (fetched[key] !== null && existing[key] !== null && typeof fetched[key] === typeof {}) {
                const result = this.loopKeys(fetched[key], existing[key]);
                matchesFound += result.matches;
                keysFound += result.keys - 1;
            } else if (fetched[key] === existing[key]) {
                matchesFound++;
            }
        });
        return {matches: matchesFound, keys: keysFound};
    }

    public killScraper(type: 'risk' | 'regions' | 'questions') {
        this.scrapers.filter(scraper => scraper.type === type).forEach(scraper => {
            console.log('killing ' + scraper.type + 'scraper');
            scraper.timeout.unref();
            this.scrapers.splice(this.scrapers.indexOf(scraper), 1);
        })
    }

    public killAllScrapers() {
        this.scrapers.forEach(scraper => {
            console.log('killing ' + scraper.type + 'scraper');
            scraper.timeout.unref();
        });
        this.scrapers = [];
    }
}