import * as d3 from 'd3';

export class Article implements d3.SimulationNodeDatum {

    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;



    private paperAbstract? : string;
    private authors? : string[];
    private children? : Article[];
    private DOI? : string;
    private isOpenAccess? : boolean;
    private isPublisherLicensed? : boolean;
    private S2PaperID : string;
    private title? : string;
    private year? : number;
    private color? : string;
    private type? : string;
    private inCitations?: number;
    private outCitations?: number;

	constructor(
    $S2PaperID: string,
    $paperAbstract?: string,
    $authors?: string[],
    $children?: Article[],
    $DOI?: string,
    $isOpenAccess?: boolean,
    $isPublisherLicensed?: boolean,
    $title?: string,
    $year?: number,
    $color?: string,
    $type?: string,
    $inCitations?: number,
    $outCitations?: number){
        this.S2PaperID = $S2PaperID;
        this.title = $title;
        this.year= $year;
        this.paperAbstract = $paperAbstract;
        this.authors = $authors;
        this.children = $children;
        this.DOI = $DOI;
        this.isOpenAccess = $isOpenAccess;
        this.isPublisherLicensed = $isPublisherLicensed;
        this.color = $color;
        this.type = $type;
        this.inCitations = $inCitations;
        this.outCitations = $outCitations;
	}

    /**
     * Getter $paperAbstract
     * @return {string}
     */
	public get $paperAbstract(): string {
		return this.paperAbstract;
	}

    /**
     * Getter $authors
     * @return {string[]}
     */
	public get $authors(): string[] {
		return this.authors;
	}

    /**
     * Getter $children
     * @return {string[]}
     */
	public get $children(): Article[] {
		return this.children;
	}


    /**
     * Getter $DOI
     * @return {string}
     */
	public get $DOI(): string {
		return this.DOI;
	}

    /**
     * Getter $isOpenAccess
     * @return {boolean}
     */
	public get $isOpenAccess(): boolean {
		return this.isOpenAccess;
	}

    /**
     * Getter $isPublisherLicensed
     * @return {boolean}
     */
	public get $isPublisherLicensed(): boolean {
		return this.isPublisherLicensed;
	}

    /**
     * Getter $S2PaperID
     * @return {string}
     */
	public get $S2PaperID(): string {
		return this.S2PaperID;
	}


    /**
     * Getter $title
     * @return {string}
     */
	public get $title(): string {
		return this.title;
	}

    /**
     * Getter $year
     * @return {number}
     */
	public get $year(): number {
		return this.year;
	}

    /**
     * Getter $color
     * @return {string}
     */
	public get $color(): string {
		return this.color;
	}
    /**
     * Getter $type
     * @return {string}
     */
	public get $type(): string {
		return this.type;
	}
  /**
     * Getter $inCitations
     * @return {string}
     */
	public get $inCitations(): number {
		return this.inCitations;
	}
  /**
     * Getter $inCitations
     * @return {string}
     */
	public get $outCitations(): number {
		return this.outCitations;
	}

    /**
     * Setter $paperAbstract
     * @param {string} value
     */
	public set $paperAbstract(value: string) {
		this.paperAbstract = value;
	}

    /**
     * Setter $authors
     * @param {string[]} value
     */
	public set $authors(value: string[]) {
		this.authors = value;
	}

    /**
     * Setter $children
     * @param {string[]} value
     */
	public set $children(value: Article[]) {
		this.children = value;
	}


    /**
     * Setter $DOI
     * @param {string} value
     */
	public set $DOI(value: string) {
		this.DOI = value;
	}

    /**
     * Setter $isOpenAccess
     * @param {boolean} value
     */
	public set $isOpenAccess(value: boolean) {
		this.isOpenAccess = value;
	}

    /**
     * Setter $isPublisherLicensed
     * @param {boolean} value
     */
	public set $isPublisherLicensed(value: boolean) {
		this.isPublisherLicensed = value;
	}

    /**
     * Setter $S2PaperID
     * @param {string} value
     */
	public set $S2PaperID(value: string) {
		this.S2PaperID = value;
	}

    /**
     * Setter $title
     * @param {string} value
     */
	public set $title(value: string) {
		this.title = value;
	}

    /**
     * Setter $year
     * @param {number} value
     */
	public set $year(value: number) {
		this.year = value;
	}
    /**
     * Setter $type
     * @param {string} value
     */
	public set $type(value: string) {
		this.type = value;
	}

    /**
     * Setter $color
     * @param {string} value
     */
	public set $color(value: string) {
		this.color = value;
	}
  /**
     * Setter $inCitations
     * @param {string} value
     */
	public set $inCitations(value: number) {
		this.inCitations = value;
	}
  /**
     * Setter $outCitations
     * @param {string} value
     */
	public set $outCitations(value: number) {
		this.outCitations = value;
	}



}
