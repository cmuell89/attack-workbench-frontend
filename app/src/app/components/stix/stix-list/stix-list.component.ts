import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { StixObject } from 'src/app/classes/stix/stix-object';
import { CollectionService } from 'src/app/services/stix/collection/collection.service';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import { RouterModule } from '@angular/router';

import { Collection } from 'src/app/classes/stix/collection';
import { Mitigation } from 'src/app/classes/stix/mitigation';
import { Software } from 'src/app/classes/stix/software';
import { Tactic } from 'src/app/classes/stix/tactic';
import { Technique } from 'src/app/classes/stix/technique';
import { Relationship } from 'src/app/classes/stix/relationship';
import { Matrix } from 'src/app/classes/stix/matrix';
import { Group } from 'src/app/classes/stix/group';
import { DisplayProperty, getDisplaySettings } from 'src/app/classes/display-settings';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-stix-list',
    templateUrl: './stix-list.component.html',
    styleUrls: ['./stix-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger("detailExpand", [
            transition(":enter", [
                style({ height: '0px', minHeight: '0px'}),
                animate("100ms cubic-bezier(0.4, 0.0, 0.2, 1)", style({height: '*'}))
            ]),
            transition(':leave', [
                animate('100ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '0px', minHeight: '0px' }))
            ])
        ]),
        trigger("fadeIn", [
            transition(":enter", [
                style({ opacity: 0 }),
                animate("500ms cubic-bezier(0.4, 0.0, 0.2, 1)", style({opacity: '1'}))
            ])
        ])
    ]
})
export class StixListComponent implements OnInit {


    @Input() public stixObjects: StixObject[]; //TODO get rid of this in favor of stix list cards loading using filters
    @Input() public config: StixListConfig = {};

    //view mode
    public mode: string = "cards";
    //options provided to the user for grouping and filtering
    public filterOptions: FilterGroup[];
    //current grouping and filtering selections
    public filter: string[] = [];
    public groupBy: string[] = [];
    // search query
    public query: string = "";

    // TABLE STUFF
    public tableColumns: string[];
    public tableColumns_controls: string[]; //including select behavior
    public tableColumnsDisplay: Map<string, string>; // property to display for each displayProperty
    public tableDetail: DisplayProperty[];
    public expandedElement: StixObject | null;
    // @ViewChild(MatSort) public sort: MatSort;
    // @ViewChild(MatPaginator) public paginator: MatPaginator;

    // Selection stuff
    public selection: SelectionModel<string>;
    /** Whether the number of selected elements matches the total number of rows. */
    // public isAllSelected() {
    //     const numSelected = this.selection.selected.length;
    //     const numRows = this.stixObjects.length;
    //     return numSelected == numRows;
    // }
    
    // /** Selects all rows if they are not all selected; otherwise clear selection. */
    // public selectAll() {
    //     this.isAllSelected() ?
    //         this.selection.clear() :
    //         this.stixObjects.forEach(row => this.selection.select(row.stixID));
    // }
    





    //all possible each type of filter/groupBy
    private types: FilterValue[] = [
        {"value": "type.group", "label": "group"},
        {"value": "type.matrix", "label": "matrix"},
        {"value": "type.mitigation", "label": "mitigation"},
        {"value": "type.software", "label": "software"},
        {"value": "type.tactic", "label": "tactic"},
        {"value": "type.technique", "label": "technique"},
    ]
    private domains: FilterValue[] = [
        {"value": "domain.enterprise-attack", "label": "enterprise"},
        {"value": "domain.mobile-attack", "label": "mobile"}
    ]
    private collections: FilterValue[];
    private statuses: FilterValue[] = [
        {"value": "status.wip", "label": "work in progress"},
        {"value": "status.awaiting-review", "label": "awaiting review"},
        {"value": "status.reviewed", "label": "reviewed"},
        {"value": "status.deprecated", "label": "deprecated"},
        {"value": "status.revoked", "label": "revoked"}
    ]

    constructor(private collectionService: CollectionService) {}

    ngOnInit() {
        // this.collections = this.collectionService.getAll().map((collection) => {return {"value": "collection." + collection.stixID, "label": collection.name}})
        this.filterOptions = []
         // parse the config
        if ("type" in this.config) { 
            this.filter.push("type." + this.config.type); 
            // set columns according to type
            let displaySettings = getDisplaySettings(this.config.type)
            this.tableColumnsDisplay = new Map<string, string>();
            for (let displayprop of displaySettings.tableColumns) {
                this.tableColumnsDisplay.set(displayprop.property, displayprop.display);
            };
            this.tableColumns = displaySettings.tableColumns.map((x) => x.property);
            this.tableDetail = displaySettings.tableDetail;
        }
        else {
            this.filterOptions.push({
                "name": "type", //TODO make more extensible to additional types
                "disabled": "type" in this.config,
                "values": this.types
            })
            this.groupBy = ["type"];
        }
        if ("relatedTo" in this.config) {

        } 
        if ("query" in this.config) {

        }
        this.tableColumns_controls = Array.from(this.tableColumns); // shallow copy
        if ("select" in this.config) {
            this.selection = new SelectionModel<string>(this.config.select == "many");
            this.tableColumns_controls.unshift("select") // add select column to view
        }

        // if ("domain" in this.config) { this.filter.push("domain." + this.config.domain); }
        // else {
        // this.filterOptions.push({
        //     "name": "domain", //TODO dynamic domain values
        //     "disabled": "domain" in this.config,
        //     "values": this.domains
        // })
        //     if (this.groupBy.length == 0) this.groupBy = ["domain"];
        // }
        // if ("collection" in this.config) { this.filter.push("collection." + this.config.collection); }
        // else {
        //     this.filterOptions.push({
        //         "name": "collection", //TODO dynamic collection list
        //         "disabled": "collection" in this.config,
        //         "values": this.collections
        //     })
        //     if (this.groupBy.length == 0) this.groupBy = ["collection"];
        // }
        // if ("status" in this.config) { this.filter.push("status." + this.config.status); }
        // else {
        this.filterOptions.push({
            "name": "status",
            "disabled": "status" in this.config,
            "values": this.statuses
        })
        //     if (this.groupBy.length == 0) this.groupBy = ["status"];
        // }
    }
}

//allowed types for StixListConfig
type type_attacktype = "collection" | "group" | "matrix" | "mitigation" | "software" | "tactic" | "technique" | "relationship";
type type_domain = "enterprise-attack" | "mobile-attack";
type type_status = "status.wip" | "status.awaiting-review" | "status.reviewed";
type selection_types = "one" | "many"
export interface StixListConfig {
    /** STIX ID; force the list to show relationships with the given object */
    relatedTo?: string;
    /** force the list to show only this type */
    type?: type_attacktype;
    /** force the list to show only objects matching this query */
    query?: any;
    /** show links to view/edit pages for relevant objects? */
    showLinks?: boolean;
    /** can the user select in this list? allowed options:
     *     "one": user can select a single element at a time
     *     "many": user can select as many elements as they want
     */
    select?: selection_types;
}

export interface FilterValue {
    value: string;
    label: string;
}
export interface FilterGroup {
    disabled?: boolean; //is the entire group disabled
    name: string;
    values: FilterValue[];
}