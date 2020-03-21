import axios from 'axios';
import cheerio from 'cheerio';

import { Region } from '../models/region';
import { Risk } from '../models/risk';
import { Suggestion } from '../models/suggestion';

const siteUrl = "https://www.folkhalsomyndigheten.se/";

const fetchData = async (endpoint: string) => {
    const result = await axios.get(siteUrl + endpoint);
    return cheerio.load(result.data);
};

export module FohmScraper {
    export async function scrapeSuggestions(): Promise<Suggestion[]> {
        let suggestions: Suggestion[] = [];
    
        const $ = await fetchData('smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/fragor-och-svar');
        const lis = $('h2.heading span:contains("Covid-19")').parent().next().find('ul li');
        lis.each((_index: number, li: any) => {
            const question = $(li).find('strong .accordion__item__title__text span').text();
            const answer = $(li).find('.textbody div p').text();
            const suggestion = {
                index: _index || 0,
                sourceId: 'FOHM',
                question: question,
                answer: answer,
                status: 'New',
                faqId: null
            };
            if (suggestion && suggestion.question && suggestion.answer) {
                suggestions = [...suggestions, (<any> suggestion) as Suggestion];
            }            
        })
        return [...suggestions];
    }
    export async function scrapeRegions(): Promise<Region[]> {
        let regions: Region[] = [];
        const $ = await fetchData('smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/aktuellt-epidemiologiskt-lage');
    
        const trs = $('table').first().find('tbody tr');
        trs.each((_index: number, tr: any) => {
            const tds = $(tr).find('td');
            const region = {
                index: _index,
                name: $(tds[0]).text(),
                cases: parseInt($(tds[1]).text(), 10) || 0,
                incidence: parseInt($(tds[2]).text(), 10) || 0,
                percent: parseInt($(tds[3]).text(), 10) || 0
            };
            regions = [...regions, (<any> region) as Region]
        });
    
        return regions;
    };
    export async function scrapeRisk(): Promise<Risk> {
        const $ = await fetchData('smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/riskbedomning/');
        const content = $('#content-primary.article.cf').first().find('p:not(:first-child)');
        return <Risk> {
            importCases: {
                description: $(content[0]).text().replace(':', '').trim(),
                risk: $(content[1]).text()
            },
            nationalSpread: {
                description: $(content[2]).text().replace(':', '').trim(),
                risk: $(content[3]).text()
            }
        };
    };
}